import {createRef, useEffect, useMemo, useRef, useState} from "react";

const mainStyle = {
    minWidth: 200,
    maxWidth: '80%',
    minHeight: 200,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
};

const editorStyle = {
    width: '100vw',
    marginTop: 54,
    minHeight: 300,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
};

const barStyle = {
    backgroundColor: 'rgba(0,0,0,0.5)'
}

function CloseIcon({onPress}) {
    return (
        <div onClick={onPress} style={{position: "relative", height: 48, width: 48}}>
            <div style={{
                position: "absolute",
                width: 24,
                height: 5,
                borderRadius: 8,
                rotate: '45deg',
                backgroundColor: 'black'
            }}/>
            <div style={{
                position: "absolute",
                width: 24,
                height: 5,
                borderRadius: 8,
                rotate: '135deg',
                backgroundColor: 'black'
            }}/>
        </div>
    )
}

function LeftBar({size}) {
    return (
        <div style={{
            ...{position: 'absolute', left: 0, width: size, height: '100%'},
            ...barStyle
        }}/>
    );
}

function RightBar({size}) {
    return (
        <div style={{
            ...{position: 'absolute', right: 0, width: size, height: '100%'},
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

export function ImageUploader() {
    const [windowData, setWindowData] = useState({
        left_size: 10,
        right_size: 10,
        bottom_size: 10,
        top_size: 10,
        target_width: 0,
        target_height: 0
    });
    const [source, setSource] = useState();
    const [sourceCropped, setSourceCropped] = useState();
    const [loadingImage, setLoadingImage] = useState(false);
    const [mainDivRef, setMainDivRef] = useState(createRef);
    const fileInputRef = useRef();
    const uploadImage = useMemo(() => {
        return () => {
            fileInputRef.current?.click()
        }
    }, [fileInputRef]);
    const handleImage = useMemo(() => {
        return (e) => {
            const file = e?.target?.files?.[0]
            if (file) {
                setLoadingImage(true);
                const fileReader = new FileReader();
                fileReader.onload = (r) => {
                    setSource(() => r?.target?.result);
                    setLoadingImage(false);
                };
                fileReader.onloadend = () => setLoadingImage(false);
                fileReader.onabort = () => setLoadingImage(false);
                fileReader.readAsDataURL(file);
            }
        }
    }, []);

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
        if (source) {
            const mainDiv = mainDivRef?.current;
            const width = mainDiv?.offsetWidth;
            const height = mainDiv?.offsetHeight;
            const smallSide = (width - height) > 0 ? height : width;
            setWindowData((p) => ({
                ...p,
                left_size: ((width - (smallSide * 0.8))) / 2,
                right_size: ((width - (smallSide * 0.8))) / 2,
                top_size: ((height - (smallSide * 0.8))) / 2,
                bottom_size: ((height - (smallSide * 0.8))) / 2,
                // bottom_width: width - (((width - (smallSide * 0.8)))),
                target_width: smallSide * 0.8
            }))
        }
    }, [source, mainDivRef]);

    const cancelCrop = useMemo(()=>{
        return ()=>{
            setSource(undefined);
            fileInputRef.current.value=null;
        }
    },[]);
    const cropImage = useMemo(()=>{
        return ()=>{
            console.log(JSON.stringify(windowData,null,2))
        }
    },[windowData]);
    return (
        <>
            <div onClick={uploadImage} style={mainStyle}>
                {
                    sourceCropped && <>
                        <img onLoad={_ => {
                            setMainDivRef(createRef);
                        }} style={{width: '100%'}} alt={''} src={sourceCropped}/>
                    </>
                }
                <input
                    multiple={false}
                    onChange={handleImage}
                    accept={'image/*'}
                    type={'file'}
                    ref={fileInputRef}
                    style={{display: 'none'}}
                />
            </div>
            {
                source && <>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        left: 0,
                        background: "black",
                        zIndex: 9999999,
                        height: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <div style={{
                            height: 54,
                            position: 'fixed',
                            top: 0,
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'row'
                        }}>
                            <div onClick={cancelCrop} style={{
                                backgroundColor: 'red',
                                flexGrow: 1,
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                cursor: 'pointer'
                            }}>
                                <span style={{
                                    fontSize: 16, fontWeight: 600, color: 'white'
                                }}>CANCEL</span>
                            </div>
                            <div style={{
                                flexGrow: 1,
                                height: '100%',
                                backgroundColor: '#343434',
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                cursor: 'pointer'
                            }}>
                                <span onClick={cropImage} style={{fontSize: 16, fontWeight: 600, color: 'white'}}>
                                    DONE CROP
                                </span>
                            </div>
                        </div>
                        <div
                            id={'id123'}
                            ref={mainDivRef}
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
                            <img onLoad={_ => {
                                setMainDivRef(createRef);
                            }} style={{width: '100%'}} alt={''} src={source}/>
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
                </>
            }
        </>
    );
}
