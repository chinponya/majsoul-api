import { Collection, MongoClient, ObjectId } from "mongodb";
import { Contest, GameResult, Player, User, Session } from "./types/types";
import { Majsoul } from "..";

interface Migration {
	perform(store: Store): Promise<void>;
}

const migrations: Migration[] = [];
export class Store {
	public contestCollection: Collection<Contest<ObjectId>>;
	public gamesCollection: Collection<GameResult<ObjectId>>;
	public sessionsCollection: Collection<Session<ObjectId>>;
	public playersCollection: Collection<Player<ObjectId>>;
	public userCollection: Collection<User<ObjectId>>;

	public async init(username: string, password: string): Promise<void> {
		const url = `mongodb://${username}:${password}@${process.env.NODE_ENV === "production" ? 'majsoul_mongo' : 'localhost'}:27017/?authMechanism=SCRAM-SHA-256&authSource=admin`;
		const client = new MongoClient(url);
		await client.connect();

		console.log("Connected successfully to server");

		const majsoulDb = client.db('majsoul');
		this.contestCollection = await majsoulDb.createCollection("contests", {});
		this.gamesCollection = await majsoulDb.createCollection("games", {});
		this.sessionsCollection = await majsoulDb.createCollection("sessions", {});
		this.sessionsCollection.createIndex({scheduledTime: -1});
		this.playersCollection = await majsoulDb.createCollection("players", {});


		const oauthDb = client.db('oauth');
		this.userCollection = await oauthDb.createCollection("users", {});
	}

	public async isGameRecorded(majsoulId: string): Promise<boolean> {
		return await this.gamesCollection.countDocuments({majsoulId}, { limit: 1 }) === 1;
	}

	public async recordGame(contestId: ObjectId, gameResult: Majsoul.GameResult): Promise<void> {
		// if (gameResult.players.length !== 4) {
		// 	console.log(`Game id ${gameResult.majsoulId} doesn't have enough players, skipping`);
		// 	return;
		// }

		const session = (await this.contestCollection.findOne(
			{ _id: contestId, 'sessions.scheduledTime': { $lte: gameResult.end_time } },
			{ projection: { "sessions.$.games": true, total: true } }
		));

		console.log(`Recording game id ${gameResult.majsoulId}`);
		const gameRecord: GameResult<ObjectId> = {
			_id: undefined,
			contestId,
			...gameResult,
			players: (await Promise.all(gameResult.players.map(player =>
				this.playersCollection.findOneAndUpdate(
					{ $or: [ { majsoulId: player.majsoulId }, { nickname: player.nickname } ] },
					{ $set: { majsoulId: player.majsoulId, nickname: player.nickname } },
					{ upsert: true, returnOriginal: false, projection: { _id: true } }
				)
			))).map(p => p.value),
		};

		await this.gamesCollection.insertOne(gameRecord);
	}

	public async migrate(): Promise<void> {
		for (const migration of migrations) {
			await migration.perform(this);
		}
	}
}
