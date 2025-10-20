'use client'

import classNames from 'classnames/bind'
import styles from './AuthCheckModal.module.scss'
import Button from '@ui/shared/button/Button'
import FormModal from '@ui/shared/modal/form-modal/FormModal'
import { forwardRef } from 'react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'

const cx = classNames.bind(styles)

type GoogleReauthModalProps = {
  onSuccess: (token: string) => void
  onClose: () => void
}

const GoogleReauthModalContent = forwardRef<HTMLDialogElement, GoogleReauthModalProps>(
  ({ onSuccess, onClose }, ref) => {
    const handleGoogleSuccess = (credentialResponse: any) => {
      if (credentialResponse.credential) {
        onSuccess(credentialResponse.credential)
      }
    }

    const handleError = () => {
      alert('Google 재인증에 실패했습니다')
      onClose()
    }

    return (
      <dialog className={cx('dialog')} ref={ref}>
        <div className={cx('contentWrapper')}>
          <FormModal title='본인 확인'>
            <div className={cx('formContainer')}>
              <p style={{ marginBottom: '20px', textAlign: 'center' }}>
                정보 수정을 위해 Google 계정으로 다시 로그인해주세요
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleError}
                  text="signin"
                  size="large"
                  locale="ko"
                />
              </div>
              <div className={cx('buttonContainer')}>
                <Button onClick={onClose} type="button" size="small" theme="gray">
                  취소
                </Button>
              </div>
            </div>
          </FormModal>
        </div>
      </dialog>
    )
  }
)

GoogleReauthModalContent.displayName = 'GoogleReauthModalContent'

const GoogleReauthModal = forwardRef<HTMLDialogElement, GoogleReauthModalProps>(
  (props, ref) => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined')
      return null
    }

    return (
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleReauthModalContent {...props} ref={ref} />
      </GoogleOAuthProvider>
    )
  }
)

GoogleReauthModal.displayName = 'GoogleReauthModal'

export default GoogleReauthModal
