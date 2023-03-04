import { useEffect } from "react";
import { ExpandSidebar } from "./expand_sidebar";
import Menu from "./menu";
import SlidingBackground from "./sliding_background";

export default function MainMenu() {
    useEffect(() => {
        console.log("we are on the main menu.")
    }, []);

    return (
        <div className="full"> 
          <Menu />
          <ExpandSidebar />
          <SlidingBackground/>
        </div>
      );
}