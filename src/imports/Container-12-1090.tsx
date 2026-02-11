import imgIdCardPreview from '../assets/74a77ec551d0ae2abfcec7d0fb127730ca1e34b8.png';

function IdCardPreview() {
  return (
    <div className="-translate-x-1/2 absolute h-[20px] left-[calc(50%+0.5px)] top-[24px] w-[42px]" data-name="IDCardPreview">
      <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgIdCardPreview} />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white relative shadow-[0px_12.5px_25px_-6px_rgba(0,0,0,0.25)] size-full" data-name="Container">
      <IdCardPreview />
      <p className="absolute font-['Roboto'] font-bold leading-[9px] left-[15px] not-italic text-[#0f172a] text-[7px] top-[63px]">Headquarter :</p>
      <p className="absolute font-['Roboto'] font-bold leading-[9px] left-[15px] not-italic text-[#0f172a] text-[7px] top-[110px]">Branches :</p>
      <p className="absolute font-['Roboto'] font-bold leading-[9px] left-[15px] not-italic text-[#0f172a] text-[7px] top-[78px]">{`Thane : `}</p>
      <p className="absolute font-['Roboto'] font-bold leading-[9px] left-[15px] not-italic text-[#0f172a] text-[7px] top-[124px]">Mahape :</p>
      <p className="absolute font-['Roboto'] font-bold leading-[9px] left-[15px] not-italic text-[#0f172a] text-[7px] top-[164px]">Pune :</p>
      <p className="absolute font-['Roboto'] leading-[9px] left-[42px] not-italic text-[#0f172a] text-[6px] top-[78px] w-[101px] whitespace-pre-wrap">201/202, New Era Business Park, Road No. 33, Wagle Industrial Estate, Thane - 400604</p>
      <p className="absolute font-['Roboto'] leading-[9px] left-[48px] not-italic text-[#0f172a] text-[6px] top-[124px] w-[97px] whitespace-pre-wrap">Unit no. 102, 1st floor, Rupa Solitaire Building no. A1, Sector 1, Millennium Business Park, Mahape, Navi Mumbai - 400710</p>
      <p className="absolute font-['Roboto'] leading-[9px] left-[48px] not-italic text-[#0f172a] text-[6px] top-[164px] w-[97px] whitespace-pre-wrap">
        Software Technology Park of India,
        <br aria-hidden="true" />
        Block No.1B, Plot No P1, MIDC,
        <br aria-hidden="true" />
        Hinjewadi Phase 1 Rd,
        <br aria-hidden="true" />
        Hinjewadi Rajiv Gandhi Infotech Park, Pune - 411-57
      </p>
    </div>
  );
}