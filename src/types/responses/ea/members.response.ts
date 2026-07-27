import type { MemberResponse } from "./member.response"

export type PositionCountResponse = {
    midfielder: number
    goalkeeper: number
    forward: number
    defender: number
    [key: string]: number
}

export type MembersResponse = {
    members: MemberResponse[]
    positionCount: PositionCountResponse
}