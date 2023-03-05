import { useEffect } from "react";
import { LogPopout } from "../../components/logging/log_popout";
import Menu from "./menu";
import SlidingBackground from "../../components/sliding_background";

export default function Main() {
    useEffect(() => {
        console.log("we are on the main menu.")
    }, []);

    return (
        <div className="full"> 
          <Menu />
          <LogPopout />
          <SlidingBackground/>
        </div>
      );
}