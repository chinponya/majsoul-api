import { Store } from "../..";
import { Han, PlayerZone } from "../../majsoul";
import { Session as StoreSession, GameResult as StoreGameResult, Player, TourneyContestType } from "../../store/types/types";

export * from "./stats";

export interface GameResult<Id = any> extends StoreGameResult<Id> {
	sessionId?: Id;
	contestId: Id;
}

export interface Session<Id = any> extends StoreSession<Id> {
	totals: Record<string, number>;
	aggregateTotals: Record<string, number>;
}

export interface ContestPlayer<Id = any> extends Player<Id> {
	tourneyScore: number;
	tourneyRank: number;
	gamesPlayed: number;
	team: {
		teams: Array<string>;
		seeded: boolean;
	}
}

export interface PhaseMetadata<Id = string> {
	index: number;
	startTime: number;
	name: string;
}

export interface LeaguePhase<Id = string> extends PhaseMetadata<Id> {
	sessions?: Session<Id>[];
	aggregateTotals?: Record<string, number>;
}

export interface PlayerInformation {
	_id: string;
	nickname: string;
	zone: PlayerZone;
}

export interface PlayerTourneyScore {
	rank: number;
	score: number;
	highlightedGameIds?: string[];
}

export interface PlayerTourneyStandingInformation {
	player: PlayerInformation;
	hasMetRequirements?: boolean;
	totalMatches: number;
	qualificationType: TourneyContestType;
	rank: number;
	scores: Record<TourneyContestType, PlayerTourneyScore>;
}

export interface TourneyPhase<Id = string> extends PhaseMetadata<Id> {
	standings?: PlayerTourneyStandingInformation[];
}

export type Phase<Id = string> = LeaguePhase<Id> | TourneyPhase<Id>


export type Contest<Id = any> = Store.Contest<Id> & {
	phases: PhaseMetadata[];
}

export interface YakumanInformation {
	han: Han[];
	player: PlayerInformation;
	game: {
		majsoulId: string;
		endTime: number;
	}
}
