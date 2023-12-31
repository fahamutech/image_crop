import {createRef, useEffect, useMemo, useState} from "react";

const barStyle = {
    backgroundColor: 'rgba(0,0,0,0.8)'
}

function LeftBar({size}) {
    return (
        <div style={{
            ...{position: 'absolute', left: 0, top: 0, bottom: 0, width: size, height: '100%'},
            ...barStyle
        }}/>
    );
}

function RightBar({size}) {
    return (
        <div style={{
            ...{position: 'absolute', right: 0, top: 0, bottom: 0, width: size, height: '100%'},
            ...barStyle
        }}/>
    );
}

function TopBar({size, width, marginLeft, marginRight}) {
    return (
        <div style={{
            ...{position: 'absolute', top: 0, width, marginLeft, marginRight, height: size},
            ...barStyle
        }}/>
    );
}

function BottomBar({size, width, marginLeft, marginRight}) {
    return (
        <div style={{
            ...{position: 'absolute', bottom: 0, width, marginLeft, marginRight, height: size},
            ...barStyle
        }}/>
    );
}

/**
 *
 * @param source
 * @param setSource
 * @param onDone{({
 *     left_size:number,
 *     right_size:number,
 *     bottom_size: number,
 *     top_size: number,
 *     target_width: number,
 *     target_height: number
 * })=>*}
 * @param mainDivRef
 * @param setMainDivRef
 * @param fileInputRef
 * @returns {JSX.Element}
 * @constructor
 */
export function ImageCrop({source, setSource, onDone, mainDivRef, setMainDivRef, fileInputRef}) {
    const [windowData, setWindowData] = useState({
        left_size: 0,
        right_size: 0,
        bottom_size: 0,
        top_size: 0,
        target_width: 0,
        target_height: 0
    });

    const moveAlongX = useMemo(() => {
        return ({screenX}) => {
            const windowWidth = window.innerWidth;
            const mainDiv = mainDivRef?.current;
            const divWidth = mainDiv?.offsetWidth;
            const divHeight = mainDiv?.offsetHeight;
            const smallSide = (divWidth - divHeight) > 0 ? divHeight : divWidth;
            const targetWidth = (smallSide * 0.8);
            const windowPad = (windowWidth - divWidth) / 2;
            const xFromDiv = screenX - windowPad;
            const xNewWidth = xFromDiv - (targetWidth / 2);
            const xNewWidthRight = divWidth - (xNewWidth + targetWidth);
            const maxPadSize = divWidth - targetWidth;
            setWindowData((p) => ({
                ...p,
                left_size: xNewWidth > 0 ? (xNewWidth >= maxPadSize ? maxPadSize : xNewWidth) : 0,
                right_size: xNewWidthRight > 0 ? (xNewWidthRight >= maxPadSize ? maxPadSize : xNewWidthRight) : 0,
            }));
            // console.log(xNewWidth);
        }
    }, [mainDivRef]);

    const moveAlongY = useMemo(() => {
        return ({screenY}) => {
            const windowHeight = window.innerHeight;
            const mainDiv = mainDivRef?.current;
            const divWidth = mainDiv?.offsetWidth;
            const divHeight = mainDiv?.offsetHeight;
            const smallSide = (divWidth - divHeight) > 0 ? divHeight : divWidth;
            const targetHeight = (smallSide * 0.8);
            const windowPad = (windowHeight - divHeight) / 2;
            const yFromDiv = screenY - windowPad;
            const yNewHeight = yFromDiv - (targetHeight / 2);
            const yNewWidthBottom = divHeight - (yNewHeight + targetHeight);
            const maxPadSize = divHeight - targetHeight;
            setWindowData((p) => ({
                ...p,
                top_size: yNewHeight > 0 ? (yNewHeight >= maxPadSize ? maxPadSize : yNewHeight) : 0,
                bottom_size: yNewWidthBottom > 0 ? (yNewWidthBottom >= maxPadSize ? maxPadSize : yNewWidthBottom) : 0,
            }));
        }
    }, [mainDivRef]);

    useEffect(() => {
        if (source && mainDivRef?.current) {
            const mainDiv = mainDivRef?.current;
            const width = mainDiv?.clientWidth;
            const height = mainDiv?.clientHeight;
            const smallSide = (width - height) > 0 ? height : width;
            setWindowData((p) => ({
                ...p,
                left_size: ((width - (smallSide * 0.8))) / 2,
                right_size: ((width - (smallSide * 0.8))) / 2,
                top_size: ((height - (smallSide * 0.8))) / 2,
                bottom_size: ((height - (smallSide * 0.8))) / 2,
                target_width: smallSide * 0.8,
                target_height: smallSide * 0.8,
            }))
        }
    }, [source, mainDivRef]);

    const cancelCrop = useMemo(() => {
        return () => {
            setSource(undefined);
            fileInputRef.current.value = null;
        }
    }, [fileInputRef, setSource]);

    const cropImage = useMemo(() => {
        return () => {
            onDone(windowData);
        }
    }, [onDone, windowData]);

    return (
        <div style={editorContainerStyle}>
            <div style={editorColumnStyle}>
                <div style={editorAppBarStyle}>
                    <div onClick={cancelCrop} style={editorCancelContainer}>
                    <span style={editorCancelText}>
                        CANCEL
                    </span>
                    </div>
                    <div style={editorDoneContainer}>
                    <span onClick={cropImage} style={editorDoneText}>
                        DONE CROP
                    </span>
                    </div>
                </div>
                <div style={editorBodyStyle}>
                    <div
                        id={'id123'}
                        onDragOver={event => {
                            const {clientX, clientY} = event;
                            moveAlongX({screenX: clientX});
                            moveAlongY({screenY: clientY});
                        }}
                        onTouchMove={event => {
                            const {changedTouches} = event
                            const {clientX, clientY} = changedTouches[0];
                            moveAlongX({screenX: clientX});
                            moveAlongY({screenY: clientY});
                        }}
                        style={editorStyle}
                    >
                        <img
                            ref={mainDivRef}
                            onLoad={_ => setMainDivRef(createRef)}
                            style={{maxWidth: '100%', maxHeight: window.innerHeight - 54, backgroundColor: 'white'}}
                            alt={''}
                            src={source}
                        />
                        <LeftBar size={windowData.left_size}/>
                        <RightBar size={windowData.right_size}/>
                        <TopBar
                            width={windowData?.target_width}
                            marginLeft={windowData.left_size}
                            marginRight={windowData.right_size}
                            size={windowData.top_size}/>
                        <BottomBar
                            width={windowData.target_width}
                            marginLeft={windowData.left_size}
                            marginRight={windowData.right_size}
                            size={windowData.bottom_size}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

const editorContainerStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    background: "black",
    zIndex: 9999999,
    height: '100vh'
};

const editorAppBarStyle = {
    minHeight: 54,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row'
};
const editorCancelContainer = {
    backgroundColor: 'red',
    flexGrow: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    cursor: 'pointer'
};
const editorCancelText = {fontSize: 16, fontWeight: 600, color: 'white'};
const editorDoneContainer = {
    flexGrow: 1,
    height: '100%',
    backgroundColor: '#343434',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    cursor: 'pointer'
};
const editorDoneText = {fontSize: 16, fontWeight: 600, color: 'white'};
const editorStyle = {
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: '#000000',
    position: 'relative',
};
const editorColumnStyle = {
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column'
};
const editorBodyStyle={
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
};
