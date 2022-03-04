import { Wind } from "../../store/types/Wind";

export enum AILevel {
	None = 0,
	Easy = 1,
	Normal = 2,
}

export interface Player {
	majsoulId: number;
	nickname: string;
}

export interface Contest {
	majsoulId: number;
	majsoulFriendlyId: number;
	name: string;
	createdTime: number;
	startTime: number;
	finishTime: number;
}

