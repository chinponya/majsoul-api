import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { Zone } from "./IndividualPlayerStandings";
import { useTranslation } from "react-i18next";
import { IState, Contest } from "../State";
import { Han } from "majsoul-api/dist/majsoul/types";
import { fetchYaku } from "src/api/Games";
import { Rest } from "majsoul-api";



export function YakuDisplay(props: { contestId: string; }): JSX.Element {
    const { t } = useTranslation();
    const contest = useSelector((state: IState) => state.contestsById[props.contestId]);

    const [yakuCounts, setYaku] = React.useState<Rest.YakuCount[]>(null);
    React.useEffect(() => {
        setYaku(null);
        if (contest?.yakuScoreboardYaku != null) {
            fetchYaku({
                contestId: props.contestId,
                yaku: contest.yakuScoreboardYaku,
                limit: contest.yakuScoreboardLimit
            }).then(setYaku);
        }
    }, [props.contestId, contest.yakuScoreboardYaku, contest.yakuScoreboardLimit, contest.yakuScoreboardYaku]);

    if (contest?.yakuScoreboardYaku == null) {
        return null;
    }

    const defaultTitle = t(`stats.yaku.names.${Han[contest.yakuScoreboardYaku].toLowerCase()}`)

    return <>
        <Row className="px-4 py-3 justify-content-end">
            <Col md="auto" className="h4 mb-0"><u>{contest.yakuScoreboardTitle || defaultTitle}</u></Col>
        </Row>
        <Row>
            <Container className="rounded bg-dark text-light text-center px-3 py-2">
                {yakuCounts == null
                    ? <Row>
                        <Col>
                            <Spinner animation="border" role="status">
                                <span className="sr-only">Loading...</span>
                            </Spinner>
                        </Col>
                    </Row>
                    : yakuCounts?.length > 0
                        ? <YakuStandings entries={yakuCounts} />
                        : <Col>
                            <div className="h4 font-weight-bold m-0">未だ無し</div>
                        </Col>
                }
            </Container>
        </Row>
    </>
}

export function YakuStandings(props: {
    entries: Rest.YakuCount[];
    limit?: number;
}): JSX.Element {
    return <Container className="py-3">
        {props.entries.map((entry, rank) =>
            <Row key={entry.player._id} className={`${rank > 0 ? "mt-3" : ""} no-gutters`} style={{ maxWidth: 640, margin: "auto" }}>
                <Container className="p-0">
                    <Row className="no-gutters align-items-center flex-nowrap">
                        <Col md="auto" style={{ minWidth: 50 }} className="mr-3 text-right"> <h5><b>{rank + 1}位</b></h5></Col>
                        <Zone zone={entry.player.zone} />
                        <Col className="text-nowrap" style={{ flexShrink: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                            <Container className="p-0">
                                <Row className="no-gutters">
                                    <Col md="auto" className="font-weight-bold h5 text-truncate" style={{ borderBottom: `3px solid ${rank == 0 ? "LightGreen" : "grey"}` }}>
                                        {entry.player.nickname}
                                    </Col>
                                </Row>
                            </Container>
                        </Col>
                        <Col md="auto" className="mr-3"> <h5><b>{entry.count}回</b></h5></Col>
                    </Row>
                </Container>
            </Row>)}
    </Container>
}