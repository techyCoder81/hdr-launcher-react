export const FullScreenDiv = (props : {children: JSX.Element[] | JSX.Element}) => {
    return <div className={'overlay-progress scroll-hidden'}>
            {props.children}
        </div>
}