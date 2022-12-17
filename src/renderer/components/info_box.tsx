import '../styles/infobox.css';

export default function InfoBox(props: { text: string }) {
  return (
    <div className="info-container">
      <div className="visible-box">
        <div>{props.text}</div>
      </div>
    </div>
  );
}
