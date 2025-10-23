import classNames from 'classnames/bind'
import styles from './ProfileForm.module.scss'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { ProfileFormInput } from '@shared/types'
import FieldLabel from '@ui/shared/input/FieldLabel/FieldLabel'
import Button from '@ui/shared/button/Button'
import PasswordFieldConnect from '@ui/shared/form-field/PasswordFieldConnect'
import { PASSWORD_VALIDATION_REGEXP, PHONE_NUMBER_VALIDATION_REGEXP } from '@ui/shared/util-constants/constants'
import useUserStore from '@zustand/useUserStore'
import { useEffect, useRef } from 'react'
import TextField from '@ui/shared/input/TextField/TextField'
import TextFieldConnect from '@ui/shared/form-field/TextFieldConnect'
import ImageUploadConnect from '@ui/shared/form-field/ImageUploadConnect/ImageUploadConnect'
import useEditUser from '../data-access-profile/useEditUser'
import AuthCheckModal from './AuthCheckModal'
import GoogleReauthModal from './GoogleReauthModal'

const cx = classNames.bind(styles)

type ProfileFormProps = {
}

const ProfileForm = ({ }: ProfileFormProps) => {
  const user = useUserStore.use.user()

  const methods = useForm<ProfileFormInput>({
    defaultValues: {
      name: user.name || '',
      imageUrl: user.imageUrl || '',
      employeeNumber: user.employeeNumber || '',
      phoneNumber: user.phoneNumber || '',
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
    }
  })
  const { handleSubmit, setValue, trigger } = methods

  const { mutate: editUser } = useEditUser()

  const authCheckDialogRef = useRef<HTMLDialogElement>(null)
  const googleReauthDialogRef = useRef<HTMLDialogElement>(null)
  const isGoogleUser = user.authProvider === 'google'

  const handleEditUser: SubmitHandler<ProfileFormInput> = async (data) => {
    authCheckDialogRef.current?.close()
    googleReauthDialogRef.current?.close()

    console.log('전송될 데이터:', data)

    const editedUserData = {
      ...data,
      password: data.password ? data.password : undefined,
      passwordConfirmation: data.passwordConfirmation ? data.passwordConfirmation : undefined,
    }

    console.log('편집된 데이터:', editedUserData)

    editUser(editedUserData, {
      onSuccess: (updatedUser) => {
        console.log('업데이트된 사용자:', updatedUser)

        // 비밀번호 필드만 초기화
        setValue('currentPassword', '')
        setValue('password', '')
        setValue('passwordConfirmation', '')

        // 업데이트된 사용자 정보로 필드 다시 설정
        setValue('name', updatedUser.name || '')
        setValue('employeeNumber', updatedUser.employeeNumber || '')
        setValue('phoneNumber', updatedUser.phoneNumber || '')
        setValue('imageUrl', updatedUser.imageUrl || '')
      }
    })
  }

  const handleGoogleReauthSuccess = async (token: string) => {
    try {
      // 1. 백엔드에 구글 재인증 요청
      const { googleReauth } = await import('@shared/api')
      const result = await googleReauth(token)

      if (result.verified) {
        // 2. 재인증 성공 후 정보 수정
        const data = methods.getValues()
        handleEditUser(data)
      } else {
        alert('재인증에 실패했습니다.')
        googleReauthDialogRef.current?.close()
      }
    } catch (error) {
      alert('재인증 중 오류가 발생했습니다.')
      googleReauthDialogRef.current?.close()
    }
  }

  const handleClickCompletedButton = async () => {
    const isValid = await trigger()
    if (!isValid) return

    if (isGoogleUser) {
      // 구글 사용자는 바로 수정
      const data = methods.getValues()
      handleEditUser(data)
    } else {
      // 일반 사용자는 항상 현재 비밀번호 인증 필요
      authCheckDialogRef.current?.showModal()
    }
  }

  useEffect(() => {
    setValue('imageUrl', user.imageUrl || '')
    setValue('employeeNumber', user.employeeNumber || '')
    setValue('phoneNumber', user.phoneNumber || '')
    setValue('name', user.name || '')
  }, [setValue, user])

  return (
    <FormProvider {...methods}>
      <form className={cx('container')} onSubmit={handleSubmit(handleEditUser)}>
        <div className={cx('inputs')}>
          <div>
            <FieldLabel label='프로필 이미지' />
            <ImageUploadConnect name='imageUrl' />
          </div>
          <div>
            <FieldLabel label='이름' />
            <TextFieldConnect
              name='name'
              placeholder='이름을 입력해 주세요'
              rules={{
                validate: value => value.trim() !== '' || '필수 입력사항입니다.',
              }}
            />
          </div>
          <div>
            <FieldLabel label='이메일' />
            <TextField
              name='email'
              value={user.email}
              disabled
            />
          </div>
          <div>
            <FieldLabel label='사원번호' />
            <TextFieldConnect
              name='employeeNumber'
              autoComplete='employee-number'
              placeholder='사원번호를 입력해 주세요'
              rules={{
                validate: value => value.trim() !== '' || '필수 입력사항입니다.',
              }}
            />
          </div>
          <div>
            <FieldLabel label='연락처' />
            <TextFieldConnect
              name='phoneNumber'
              autoComplete='tel'
              placeholder='연락처를 입력해 주세요'
              rules={{
                validate: value => value.trim() !== '' || '필수 입력사항입니다.',
                pattern: {
                  value: PHONE_NUMBER_VALIDATION_REGEXP,
                  message: '전화번호 형식에 맞지 않습니다(하이픈 포함 필요)',
                },
              }}
            />
          </div>
          {!isGoogleUser && (
            <>
              <div>
                <FieldLabel label='새 비밀번호' />
                <PasswordFieldConnect
                  name='password'
                  autoComplete='new-password'
                  placeholder='변경하지 않으려면 비워두세요'
                  rules={{
                    validate: value => {
                      if (!value) return true // 비어있으면 통과 (변경 안함)
                      return PASSWORD_VALIDATION_REGEXP.test(value) || '영문, 숫자 조합 8~16자리로 입력해주세요'
                    },
                  }}
                />
              </div>
              <div>
                <FieldLabel label='새 비밀번호 확인' />
                <PasswordFieldConnect
                  name='passwordConfirmation'
                  autoComplete='new-password'
                  placeholder='새 비밀번호를 한번 더 입력해 주세요'
                  rules={{
                    validate: value => {
                      const password = methods.getValues('password')
                      if (!password && !value) return true // 둘 다 비어있으면 통과
                      return value === password || '비밀번호가 일치하지 않습니다'
                    },
                  }}
                />
              </div>
            </>
          )}
        </div>
        <Button
          type='button'
          size='large'
          theme='red'
          onClick={(e) => {
            e.preventDefault()
            handleClickCompletedButton()
          }}
        >확인
        </Button>
        {isGoogleUser ? (
          <GoogleReauthModal
            ref={googleReauthDialogRef}
            onSuccess={handleGoogleReauthSuccess}
            onClose={() => { googleReauthDialogRef.current?.close() }}
          />
        ) : (
          <AuthCheckModal
            ref={authCheckDialogRef}
            fieldName='currentPassword'
            onClose={() => { authCheckDialogRef.current?.close() }}
          />
        )}
      </form>
    </FormProvider>
  )
}

export default ProfileForm
