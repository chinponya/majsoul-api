import * as fs from "fs";
import * as path from "path";

export interface ISecrets {
	publicAddress: string;
	listenPort: number;
	publicKeyFile: string;
	privateKeyFile: string;
	majsoul: {
		uid: string;
		accessToken: string;
	};
	google: {
		clientId: string;
		clientSecret: string;
	}
	mongo: {
		username: string;
		password: string;
		address: string;
		port: number;
	}
	riichiRoot: {
		username: string;
		password: string;
	}
}

function getDefaults(): ISecrets {
	const defaultSecretsDirectory = process.env.NODE_ENV === "production" ? "/run/secrets/" : path.dirname(process.argv[1]);
	return {
		publicAddress: "http://localhost:8080",
		listenPort: 9515,
		publicKeyFile: path.join(defaultSecretsDirectory, "riichi.crt.pem"),
		privateKeyFile: path.join(defaultSecretsDirectory, "riichi.key.pem"),
		majsoul: {
			uid: undefined,
			accessToken: undefined,
		},
		google: {
			clientId: undefined,
			clientSecret: undefined,
		},
		mongo: {
			username: undefined,
			password: undefined,
			address: process.env.NODE_ENV === "production" ? "majsoul_mongo" : "localhost",
			port: 27017,
		},
		riichiRoot: {
			username: "admin",
			password: undefined
		}
	}
}

function getEnvSecrets(): ISecrets {
	return {
		publicAddress: process.env.MAJSOUL_PUBLIC_ADDRESS,
		listenPort: parseInt(process.env.MAJSOUL_LISTEN_PORT) || undefined,
		publicKeyFile: process.env.MAJSOUL_PUBLIC_KEY,
		privateKeyFile: process.env.MAJSOUL_PRIVATE_KEY,
		majsoul: {
			uid: process.env.MAJSOUL_UID,
			accessToken: process.env.MAJSOUL_ACCESS_TOKEN,
		},
		google: {
			clientId: process.env.MAJSOUL_GOOGLE_CLIENT_ID,
			clientSecret: process.env.MAJSOUL_GOOGLE_CLIENT_SECRET,
		},
		mongo: {
			username: process.env.MAJSOUL_DB_USERNAME,
			password: process.env.MAJSOUL_DB_PASSWORD,
			address: process.env.MAJSOUL_DB_ADDRESS,
			port: parseInt(process.env.MAJSOUL_DB_PORT) || undefined,
		},
		riichiRoot: {
			username: process.env.MAJSOUL_ADMIN_USERNAME,
			password: process.env.MAJSOUL_ADMIN_PASSWORD
		}
	}
}

function mergeSecrets(...objects: ISecrets[]): ISecrets {
	return objects.reduce((result, current, index) => {
		Object.keys(current).forEach((key) => {
			if (typeof result[key] === "object" && typeof current[key] === "object") {
				result[key] = mergeSecrets(result[key], current[key]);
			} else {
				result[key] = current[key] || result[key];
			}
		});
		return result;
	}, {}) as ISecrets;
}

function checkSecrets(secrets: ISecrets, checkFun?: (path: string, value: string) => void): void {
	if (!checkFun) {
		checkFun = (path: string, value: string) => {
			if (!value) {
				throw `Configuration is missing a required value for "${path}"`;
			}
		}
	}
	Object.keys(secrets).forEach((key) => {
		if (typeof secrets[key] === "object") {
			const nestedCheckFun = (path: string, value: string) => checkFun(`${key}.${path}`, value);
			checkSecrets(secrets[key], nestedCheckFun);
		} else {
			checkFun(key, secrets[key]);
		}
	});
}

export function getSecretsFilePath(): string {
	return process.env.MAJSOUL_SECRETS_FILE ||
		process.argv[2] ||
		path.join(path.dirname(__filename), "secrets.json");
}

export function getSecrets(): ISecrets {
	const filePath = getSecretsFilePath();
	let fileConfig: ISecrets;
	if (fs.existsSync(filePath)) {
		fileConfig = JSON.parse(fs.readFileSync(filePath, "utf8"));
	} else {
		console.warn(`Configuration file was not found in "${filePath}". Falling back to environement variables and default values`);
		fileConfig = getDefaults();
	}

	const secrets = mergeSecrets(
		getDefaults(),
		fileConfig,
		getEnvSecrets()
	)

	checkSecrets(secrets);

	return secrets;
}
