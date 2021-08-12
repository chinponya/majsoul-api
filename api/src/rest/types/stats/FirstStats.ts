import { StatsVersion } from "./StatsVersion";
import { Han } from "../../../majsoul/types/Han";

export interface RiichiStats {
	total: number;
	furiten: number;
	first: number;
	chase: number; //player chases
	chased: number; //player is chased
	ippatsu: number;
	uraHit: number;
}

export interface DealerStats {
	tsumoHit: number; //someone else tsumos
	tsumoHitPoints: number;
	tsumoHitMangan: number; //'' with mangan or above
}

export interface CallStats {
	openedHands: number; //hands opened
	total: number; //chinponyas
	opportunities: number; //opportunities
	repeatOpportunities: number; //'' including subsequent shouminkan/ankan chances
}

export interface AgariStats {
	total: number;
	points: number;
}

export interface AgariCategories<T> {
	open: T;
	dama: T;
	riichi: T;
}

export interface SelfAgariStats extends AgariCategories<AgariStats> {
	tsumo: number;
}

export interface DrawStats {
	total: number;
	tenpai: number; //tenpai at draw
	open: number; //open hand at draw
	riichi: number;
}

export type YakuCount = {
	[key: string]: number;
}

export interface FirstStats {
	version: StatsVersion.First;
	stats: {
		gamesPlayed: number;
		totalHands: number;
		totalHaipaiShanten: number;
		totalRank: number;

		uraDora: number;
		akaDora: number;

		riichi: RiichiStats;
		dealer: DealerStats;
		calls: CallStats;
		wins: SelfAgariStats;
		dealins: AgariCategories<AgariCategories<AgariStats>>;
		draws: DrawStats;
		yakuAchieved: YakuCount;
	}
}

function createAgariStats(): AgariCategories<AgariStats> {
	return {
		dama: {
			points: 0,
			total: 0,
		},
		riichi: {
			points: 0,
			total: 0,
		},
		open: {
			points: 0,
			total: 0,
		}
	}
}

function createYakuStats(): YakuCount {
	return Object.keys(Han)
		.filter(key => typeof Han[key] === "number")
		.reduce((acc, value) => {
			acc[value] = 0;
			return acc
		}, {});
}

export function createStats(): FirstStats['stats'] {
	return {
		gamesPlayed: 0,
		totalHands: 0,
		totalRank: 0,
		totalHaipaiShanten: 0,
		uraDora: 0,
		akaDora: 0,
		riichi: {
			total: 0,
			uraHit: 0,
			first: 0,
			chase: 0,
			chased: 0,
			furiten: 0,
			ippatsu: 0,
		},
		dealer: {
			tsumoHit: 0,
			tsumoHitPoints: 0,
			tsumoHitMangan: 0,
		},
		calls: {
			openedHands: 0,
			total: 0,
			opportunities: 0,
			repeatOpportunities: 0,
		},
		wins: {
			...createAgariStats(),
			tsumo: 0,
		},
		dealins: {
			open: createAgariStats(),
			riichi: createAgariStats(),
			dama: createAgariStats(),
		},
		draws: {
			total: 0,
			tenpai: 0,
			open: 0,
			riichi: 0,
		},
		yakuAchieved: createYakuStats(),
	}
}
