import {createRef, useMemo, useRef, useState} from "react";
import {ImageCrop} from "./ImageCrop";

const mainStyle = {
    minWidth: 200,
    maxWidth: '80%',
    minHeight: 200,
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
};


export function ImageUploader() {
    const [source, setSource] = useState();
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
                const fileReader = new FileReader();
                fileReader.onload = (r) => {
                    setSource(_5 => r?.target?.result);
                };
                fileReader.readAsDataURL(file);
            }
        }
    }, []);
    const [sourceCropped, setSourceCropped] = useState(undefined);
    return (
        <>
            <div onClick={uploadImage} style={mainStyle}>
                {
                    sourceCropped && <>
                        <img style={{maxWidth: 250, maxHeight: '80%', borderRadius: 8}} alt={''} src={sourceCropped}/>
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
                    <ImageCrop
                        mainDivRef={mainDivRef}
                        setMainDivRef={setMainDivRef}
                        fileInputRef={fileInputRef}
                        source={source}
                        setSource={setSource}
                        onDone={(d) => {
                            const img = new Image();
                            img.onload = () => {
                                const myCanvas = document.createElement('canvas');
                                const widthRatio = img.naturalWidth / mainDivRef.current?.width;
                                const heightRatio = img.naturalHeight / mainDivRef.current.height;
                                myCanvas.width = widthRatio * d.target_width;
                                myCanvas.height = heightRatio * d.target_height;
                                const context = myCanvas.getContext('2d');
                                context.drawImage(
                                    img,
                                    widthRatio * d.left_size,
                                    heightRatio * d.top_size,
                                    widthRatio * (d.target_width),
                                    heightRatio * (d.target_height),
                                    0,
                                    0,
                                    widthRatio * d.target_width,
                                    widthRatio * d.target_height
                                );
                                setSourceCropped(myCanvas.toDataURL());
                                myCanvas.remove();
                                setSource(undefined);
                                fileInputRef.current.value = null;
                            }
                            img.src = source;
                        }}
                    />
                </>
            }
        </>
    );
}
