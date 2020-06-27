import * as React from "react";
import { LeagueStandingChart } from "./LeagueStandingChart";
import { fetchGames, fetchContestSummary } from "../Actions";
import { IState } from "../State";
import { useSelector, useDispatch } from "react-redux";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Session } from "./Session";
import { Teams } from "./Teams";

export function ContestSummary(this: void, props: {contestId: string}): JSX.Element {
	const contest = useSelector((state: IState) => state.contest);
	const games = useSelector((state: IState) => Object.values(state.games ?? [])?.sort((a, b) => b.end_time - a.end_time));
	const dispatch = useDispatch();
	const [secret, setSecret] = React.useState(false);
	React.useEffect(() => {
		if (!secret) {
			return;
		}
		new Audio(require("../../assets/tuturu.mp3").default).play();
		setTimeout(() => setSecret(false), 5000);
	}, [secret]);

	React.useEffect(() => {
		fetchContestSummary(dispatch, props.contestId);
	}, [props.contestId]);

	// React.useEffect(() => {
	// 	fetchContestSummary(dispatch, props.contestId);
	// }, [props.contestId]);

	if (contest == null) {
		return null;
	}

	const nextSessionIndex = contest.sessions.findIndex(session => session.scheduledTime > Date.now());
	const nextSession = contest.sessions[nextSessionIndex];
	const currentSession = contest.sessions[nextSessionIndex - 1];

	return <Container>
		<Row className="px-4 pt-4 pb-3">
			<Col>
				<h1 className="align-self-center" onClick={() => setSecret(true)}><u style={{cursor: "pointer"}}>{contest.name}</u></h1>
			</Col>
			<Col md="auto" className="align-self-center">
				<i>
					{secret
						? "This is a Shamikoposter world you're just living in it."
						: "Winning is for Losers."}
					</i>
				</Col>
		</Row>
		<Row className="mt-3">
			<Teams session={currentSession} />
		</Row>
		<Row className="mt-3">
			<LeagueStandingChart contest={contest} />
		</Row>
		<Row className="mt-3">
			<Session session={currentSession}></Session>
		</Row>
		<Row className="mt-3">
			<Session session={nextSession}></Session>
		</Row>
		{/* <Row className="mt-3">
			<HistoricalSession games={this.props.games?.slice(0, 8) ?? []} teams={contest.teams}></HistoricalSession>
		</Row> */}
	</Container>
}
