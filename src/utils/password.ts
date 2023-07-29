import dayjs from 'dayjs'

export const isValidPassword = (password: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)
}

export const isRequestPasswordAttemptExpired = (
  resetPasswordExpireTime: Date
): boolean => {
  return (
    dayjs().isSame(resetPasswordExpireTime) ||
    dayjs().isAfter(resetPasswordExpireTime)
  )
}
