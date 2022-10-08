export default function Loading(props: any) {
    return <div className="overlay"> 
        <div className="loading">
            {props.entering == true ? <div>
            <h1 className="loading-left">HewDraw</h1>
            <h1 className="loading-right">Remix</h1>
            </div> : <div>
            <h1 className="leaving-left">HewDraw</h1>
            <h1 className="leaving-right">Remix</h1>
            </div>
            } 
        </div>
</div> 
}