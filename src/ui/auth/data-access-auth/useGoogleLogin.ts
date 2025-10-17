import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { setTokenCookies } from '@shared/auth'

interface GoogleLoginRequest {
  token: string
  companyCode?: string
}

interface GoogleLoginResponse {
  user: {
    id: number
    name: string
    email: string
    employeeNumber: string
    phoneNumber?: string
    imageUrl?: string
    isAdmin: boolean
    company: {
      companyCode: string
    }
  }
  accessToken: string
  refreshToken: string
}

export interface GoogleUserInfo {
  email: string
  name: string
  token: string
}

const useGoogleLogin = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: GoogleLoginRequest) => {
      const response = await axios.post<GoogleLoginResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google`,
        data,
      )
      return response.data
    },
    onSuccess: (data) => {
      // 토큰 저장
      setTokenCookies(data.accessToken, data.refreshToken)

      // 메인 페이지로 리다이렉트
      router.push('/')
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Google 로그인에 실패했습니다'

      // 등록되지 않은 사용자인 경우
      if (errorMessage.includes('등록되지 않은 사용자')) {
        // 회원가입 페이지로 이동하도록 에러를 던짐
        throw error
      }

      alert(errorMessage)
    },
  })
}

export default useGoogleLogin
