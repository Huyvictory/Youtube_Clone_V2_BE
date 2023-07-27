import dayjs from 'dayjs'

export const isVerifyTokenExpired = (verifyTokenExpireTime: Date): boolean => {
  return (
    dayjs().isSame(verifyTokenExpireTime) ||
    dayjs().isAfter(verifyTokenExpireTime)
  )
}
