/*
 * Copyright 2021 Cognite AS
 */

import { useEffect, useState } from 'react';
import { DragEvent } from 'react-router/node_modules/@types/react';

interface RotationData {
  a: number,
  b: number,
  c: number,
  d: number
}

interface PositionData {
  x: number,
  y: number,
  z: number
}

interface MotionData {
  rotation: RotationData,
  position: PositionData,
  timestamp: number
}

const mockRotationData = () => {
  return { a: 0, b: 0, c: 0, d: 0 };
}

const mockPositionData = () => {
  return { x: 0, y: 0, z: 0};
}

const mockMotionData = (count : number) => {
  const data: MotionData[] = [];
  for(let i = 0; i < count; i++) {
    data.push(
      {
        rotation: mockRotationData(),
        position: mockPositionData(),
        timestamp: i * 1000
      }
    )
  }
  return data
}

const dataList: MotionData[] = mockMotionData(30)

const TimeLine = (props: TimeState, live: boolean) => {
  const [isLive, setIsLive] = useState(live);
  const [timeState, setTimeState] = useState(props);
  const [prevTime, setPrevTime] = useState(props.startTime);


  function tick() {
    const now = Date.now();
    const deltaTime = now - prevTime;
    setTimeState(timeState => ({
      ...timeState,
      playTime: timeState.playTime + deltaTime
    }));
    setPrevTime(now);
  }

  useEffect(() => {
    const intervalHandle = setInterval(tick, 1000);
    return () => {
      clearInterval(intervalHandle)
    }
  })


  return timeState
}

interface PlayButtonProps {
  playing: boolean
  onClick: () => void
}

const PlayButton = (props: PlayButtonProps) => {
  return (<button onClick={props.onClick}><h1>{props.playing ? "Pause" : "Play"}</h1></button>)
}

interface SeekBarProps {
  startTime: number
  seekTime: number
  endTime: number
  onSeek: (event: DragEvent) => void
}

const SeekBar = (props: SeekBarProps) => {

  const BAR_WIDTH = 200
  const DURATION = props.endTime - props.startTime
  const REL_SEEK_TIME = props.seekTime - props.startTime
  const REL_SEEK_FRACTION = REL_SEEK_TIME / DURATION
  const REL_SEEK_POSITION = REL_SEEK_FRACTION * BAR_WIDTH


  const backgroundStyle = {
    width: "" + BAR_WIDTH + "px",
    height: "20px",
    padding: "2px",
    backgroundColor: "#424242",
  }

  const fillStyle = {
    width: "" + REL_SEEK_POSITION + "px",
    height: "16px",
    backgroundColor: "#fe4242"
  }

  const buttonStyle = {
    marginLeft: "" + (REL_SEEK_POSITION - 8) + "px",
    width: "16px",
    height: "16px",
    backgroundColor: "#fe6868",
    border: "1px solid rgba(255, 255, 255, 255)"
  }

  return (
    <div style={backgroundStyle}>
      <div style={fillStyle}>
        <div style={buttonStyle} onDrag={props.onSeek}></div>
      </div>
    </div>
  )
}

const Player = (props: PlayerProps) => {

  const [state, setState] = useState(props)
  const [previousTime, setPreviousTime] = useState(Date.now())
  const [dataPosition, setDataPosition] = useState(findPosition(0))

  function handlePlayPause() {
    setState({
      ...state,
      isPlaying: !state.isPlaying
    });
  }

  function findPosition(initialPos: number) {
    for(let i = initialPos; i < props.motionData.length -1; ) {
      if(state.seekTime < props.motionData[i].timestamp) {
        return i;
      }
      i++
    }
    return 0;
  }

  function tick() {
    const now = Date.now()
    const deltaTime = now - previousTime;
    let changes = {}
    if(state.isPlaying) {
      const seekTime = Math.min(state.endTime, state.seekTime + deltaTime)
      changes = {
        seekTime: seekTime
      }
      if(state.endTime == seekTime) {
        changes = {
          ...changes,
          isPlaying: false
        }
      }
      if(dataPosition != undefined) {
        const oldPosition = dataPosition;
        const newPosition = findPosition(dataPosition);
        if(oldPosition != newPosition) {
          setDataPosition(newPosition)
          state.handleNewData(state.motionData[newPosition])
        }
      }
    }

    setState({
      ...state,
      ...changes
    })
    setPreviousTime(now)

    //console.log(state.motionData[dataPosition])
  }

  useEffect(() => {
    const intervalHandle = setInterval(tick, 300);

    return () => {
      clearInterval(intervalHandle)
    }
  })

  function onSeekStart() {}

  function onSeekMove() {}

  function onSeek(event: DragEvent) {
    console.log(event)
  }

  function onSeekEnd() {}

  return (
    <div>
      <PlayButton playing={state.isPlaying} onClick={handlePlayPause}/>
      <SeekBar startTime={state.startTime} seekTime={state.seekTime} endTime={state.endTime} onSeek={onSeek}/>
    </div>
  )
}

interface PlayerProps {
  isPlaying: boolean
  startTime: number
  seekTime: number
  endTime: number
  motionData: MotionData[]
  handleNewData: (data: MotionData) => void
}

interface TimeState {
  startTime: number,
  playTime: number,
  endTime: number,

}

export function Playground() {
  const now = Date.now();
  const duration = 30000;
  const { startTime, playTime, endTime } = TimeLine({ startTime: now, playTime: now, endTime: now + duration}, false)

  useEffect(() => {

  })


  function handleNewData(data: MotionData) {
    console.log(data)
  }

  return (
    <Player isPlaying={false} startTime={0} seekTime={0} endTime={30000} motionData={dataList} handleNewData={handleNewData}/>
  );
}
