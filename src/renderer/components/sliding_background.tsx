import { Backend } from '../operations/backend';

export default function SlidingBackground() {
  return (
    
    <div>
      {Backend.isNode() ? (
        <div>
          <div className="bg"></div>
          <div className="bg bg2"></div>
          <div className="bg bg3"></div>
        </div>
        ) : (
          <div className="gradient-background"></div>
        )}
    </div>
  );
}
