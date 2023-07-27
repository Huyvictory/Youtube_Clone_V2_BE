import dayjs from 'dayjs'

export const addMinutesFromNow = (minutes: number) => {
  return dayjs().add(minutes, 'minutes').toDate()
}

export const createDateNow = () => {
  return dayjs().toDate()
}
