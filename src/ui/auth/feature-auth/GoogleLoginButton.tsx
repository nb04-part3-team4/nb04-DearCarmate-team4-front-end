'use client'

import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import useGoogleLogin from '../data-access-auth/useGoogleLogin'
import classNames from 'classnames/bind'
import styles from './GoogleLoginButton.module.scss'
import { useRouter } from 'next/navigation'

const cx = classNames.bind(styles)

type GoogleLoginButtonProps = {
  className?: string
}

// Google JWT 토큰 디코딩 함수
const decodeGoogleToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

const GoogleLoginButtonContent = ({ className }: GoogleLoginButtonProps) => {
  const { mutate } = useGoogleLogin()
  const router = useRouter()

  const handleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const decodedToken = decodeGoogleToken(credentialResponse.credential)

      mutate(
        { token: credentialResponse.credential },
        {
          onError: (error: any) => {
            const errorMessage = error.response?.data?.message || ''

            // 등록되지 않은 사용자인 경우 회원가입 페이지로 이동
            if (errorMessage.includes('등록되지 않은 사용자')) {
              // Google 정보를 세션 스토리지에 저장
              if (decodedToken) {
                sessionStorage.setItem(
                  'googleSignUpInfo',
                  JSON.stringify({
                    email: decodedToken.email,
                    name: decodedToken.name,
                    token: credentialResponse.credential,
                  }),
                )
              }
              router.push('/signup')
            } else {
              alert(errorMessage || 'Google 로그인에 실패했습니다')
            }
          },
        },
      )
    }
  }

  const handleError = () => {
    alert('Google 로그인에 실패했습니다')
  }

  return (
    <div className={cx('container', className)}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text="signin_with"
        size="large"
        width="520"
        locale="ko"
      />
    </div>
  )
}

const GoogleLoginButton = (props: GoogleLoginButtonProps) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined')
    return null
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLoginButtonContent {...props} />
    </GoogleOAuthProvider>
  )
}

export default GoogleLoginButton
