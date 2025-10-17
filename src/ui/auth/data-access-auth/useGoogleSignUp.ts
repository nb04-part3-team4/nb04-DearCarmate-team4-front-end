import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { setTokenCookies } from '@shared/auth'

interface GoogleSignUpRequest {
  token: string
  name: string
  employeeNumber: string
  phoneNumber: string
  companyCode: string
}

interface GoogleSignUpResponse {
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

const useGoogleSignUp = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: GoogleSignUpRequest) => {
      const response = await axios.post<GoogleSignUpResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google/signup`,
        data,
      )
      return response.data
    },
    onSuccess: (data) => {
      // 토큰 저장
      setTokenCookies(data.accessToken, data.refreshToken)

      // 메인 페이지로 리다이렉트
      alert('회원가입이 완료되었습니다!')
      router.push('/')
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Google 회원가입에 실패했습니다'
      alert(errorMessage)
    },
  })
}

export default useGoogleSignUp
