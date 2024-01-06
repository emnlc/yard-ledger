import { Link } from "react-router-dom";

interface Props {
  id: string;
  clientName: string;
  street: string;
  cityZip: string;
  lot?: number; // optional
}

const Card = (props: Props) => {
  return (
    <>
      <div className="border flex flex-col overflow-hidden w-full md:w-60 lg:w-72 h-40 rounded-lg shadow-lg">
        <div className="bg-neutral-100 border-b w-full p-2 card-title flex ">
          {props.clientName}
        </div>
        <div className="bg-white card-body w-full p-2 h-full flex flex-col justify-between">
          <div className=" card-info self-start flex flex-col w-full">
            {props.lot && <span id="lot-number">Lot #{props.lot}</span>}
            <span id="street-address">{props.street}</span>
            <span id="city-zip">{props.cityZip}</span>
          </div>

          <div className="card-btns flex self-end gap-4">
            <button className="transition-all hover:brightness-95 ">
              <img className="h-7 w-7" src="/edit.svg" alt="" />
            </button>

            <Link
              className="transition-all hover:brightness-95 "
              to={`/home/client-invoice/${props.id}`}
            >
              <img className="h-7 w-7" src="/dollar.svg" alt="" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
