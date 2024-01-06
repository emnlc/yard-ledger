interface Props {
  text: string;
  id: string;
  color: string;
  clickFunction: () => void;
  img?: string; // optional
}

const Button = (props: Props) => {
  const btnClass = `font-semibold ${props.color} rounded-lg px-4 py-2 text-lg text-white shadow-md transition-all hover:brightness-95`;
  return (
    <button id={props.id} className={btnClass} onClick={props.clickFunction}>
      {props.text}
    </button>
  );
};

export default Button;
