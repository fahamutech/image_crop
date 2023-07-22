import {ImageUploader} from "../../core/components/ImageUploader";
import {WhiteSpace} from "../../core/components/WhiteSpace";

export function OnBoardPage() {
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <WhiteSpace height={24}/>
            <ImageUploader/>
        </div>
    )
}