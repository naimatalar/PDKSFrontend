import { useEffect, useState } from "react";
import ReactCrop from "react-image-crop";
import DebisButton from "./button";
import 'react-image-crop/dist/ReactCrop.css'
const ImageCrop = ({ Source, ReturnedImage, show }) => {
    // const [clipBoard, setClipBoard] = useState();
    const [crop, setCrop] = useState({ x: 165, y: 93, width: 136, height: 80, unit: 'px' });
    const [croppedFile, setCroppedFile] = useState();
    const [resImage, setResImage] = useState();
    const [showW, setShowW] = useState();


    useEffect(() => {
        setResImage(Source)
        setShowW(show)


    }, [Source, show])

    const imageChange = async (img) => {


        setCroppedFile(undefined);
        const image = document.getElementById("source");

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');
        const pixelRatio = window.devicePixelRatio;



        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );
        canvas.toBlob(
            (blob) => {
                const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
                ReturnedImage(file);
            },
            'image/jpeg',
            1
        );
        // setClipBoard(undefined)
        // const ctx = canvas.getContext("2d");

        //    ctx.drawImage(image, 0, 0);
        // ctx.drawImage(image, crop.x,crop.y,crop.width,crop.height);
        // ctx.drawImage(image, crop.x,crop.y, image.width, image.height, crop.x,crop.y,crop.width,crop.height);
        setShowW(false)
    }
    return (<>
        {resImage && showW && <div className="crop-container row justify-content-center" style={{ overflow:"scroll" }} >

        <div style={{ display: "none" }}><canvas id="canvas"></canvas></div>
            {resImage && URL.createObjectURL(resImage) && <div style={{ display: "none" }} >
                <img id="source" src={URL.createObjectURL(resImage)} />
            </div>}
            <div>
                <div className="row justify-content-center">
                    <DebisButton onClick={x => imageChange()}>Uygula</DebisButton>
                    <DebisButton onClick={x => setShowW(false)}>İptal Et</DebisButton>
                </div>
                {/* style={{ zoom: "0.67" }} */}
                <div >
                    <ReactCrop crop={crop} onComplete={c => console.log(c)} onChange={c => { setCrop(c) }}>
                        {/* {console.log("cnv", async()=>await resizeImage(clipBoard,540))}

{console.log("cspp",clipBoard)} */}
                        <img style={{ margin: "0 auto" }} src={URL.createObjectURL(resImage)} />
                    </ReactCrop>
                </div>
            </div>



        </div>
        }</>

    )
}
export default ImageCrop