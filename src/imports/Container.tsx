import imgIdCardPreview from "figma:asset/74a77ec551d0ae2abfcec7d0fb127730ca1e34b8.png";

function IdCardPreview() {
  return (
    <div className="absolute h-[20px] left-[100px] top-[10px] w-[42px]" data-name="IDCardPreview">
      <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgIdCardPreview} />
    </div>
  );
}

function Text() {
  return (
    <div className="h-[12px] relative shrink-0 w-[32.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Roboto'] leading-[12px] left-0 not-italic text-[#94a3b8] text-[8px] top-0">No photo</p>
      </div>
    </div>
  );
}

function IdCardPreview1() {
  return (
    <div className="absolute bg-[#f1f5f9] content-stretch flex h-[80px] items-center justify-center left-[44.5px] top-[78px] w-[64px]" data-name="IDCardPreview">
      <Text />
    </div>
  );
}

function IdCardPreview2() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-0 overflow-clip px-[12px] top-[165px] w-[153px]" data-name="IDCardPreview">
      <p className="flex-[1_0_0] font-['Roboto'] font-bold leading-[20px] min-h-px min-w-px not-italic relative text-[#0f172a] text-[18px] text-center whitespace-pre-wrap">Shreyas V</p>
    </div>
  );
}

function IdCardPreview3() {
  return (
    <div className="absolute h-[10px] left-0 overflow-clip top-[193px] w-[153px]" data-name="IDCardPreview">
      <p className="-translate-x-1/2 absolute font-['Roboto'] font-bold leading-[10px] left-[76.76px] not-italic text-[#0f172a] text-[8px] text-center top-0">1111</p>
    </div>
  );
}

function IdCardPreview4() {
  return (
    <div className="absolute h-[7px] left-0 top-[232px] w-[153px]" data-name="IDCardPreview">
      <p className="-translate-x-1/2 absolute font-['Roboto'] leading-[7px] left-[76.67px] not-italic text-[#0f172a] text-[5px] text-center top-[0.25px] w-[40px] whitespace-pre-wrap">Valid till Dec 2030</p>
    </div>
  );
}

function IdCardPreview5() {
  return (
    <div className="content-stretch flex h-[27.527px] items-start relative w-[7px]" data-name="IDCardPreview">
      <p className="font-['Roboto'] leading-[7px] not-italic relative shrink-0 text-[#0f172a] text-[5px]">12 Jan 2024</p>
    </div>
  );
}

function IdCardPreview6() {
  return (
    <div className="absolute h-[9px] left-[11px] top-[214px] w-[52.75px]" data-name="IDCardPreview">
      <p className="absolute font-['Roboto'] font-bold leading-[9px] left-0 not-italic text-[#0f172a] text-[7px] top-0">+91 9898989898</p>
    </div>
  );
}

function IdCardPreview7() {
  return (
    <div className="absolute h-[9px] left-[69.75px] top-[214px] w-[1.961px]" data-name="IDCardPreview">
      <p className="absolute font-['Roboto'] font-bold leading-[9px] left-0 not-italic text-[#0f172a] text-[7px] top-0">|</p>
    </div>
  );
}

function IdCardPreview8() {
  return (
    <div className="absolute h-[9px] left-[77.71px] top-[214px] w-[9.145px]" data-name="IDCardPreview">
      <p className="absolute font-['Roboto'] font-bold leading-[9px] left-0 not-italic text-[#0f172a] text-[7px] top-0">B+</p>
    </div>
  );
}

function IdCardPreview9() {
  return (
    <div className="absolute h-[9px] left-[92.86px] top-[214px] w-[1.961px]" data-name="IDCardPreview">
      <p className="absolute font-['Roboto'] font-bold leading-[9px] left-0 not-italic text-[#0f172a] text-[7px] top-0">|</p>
    </div>
  );
}

function IdCardPreview10() {
  return (
    <div className="absolute h-[9px] left-[100.82px] top-[214px] w-[40.195px]" data-name="IDCardPreview">
      <p className="absolute font-['Roboto'] font-bold leading-[9px] left-0 not-italic text-[#0f172a] text-[7px] top-0">www.acc.ltd</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[11px] top-[214px]">
      <IdCardPreview6 />
      <IdCardPreview7 />
      <IdCardPreview8 />
      <IdCardPreview9 />
      <IdCardPreview10 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white relative shadow-[0px_12.5px_25px_-6px_rgba(0,0,0,0.25)] size-full" data-name="Container">
      <IdCardPreview />
      <IdCardPreview1 />
      <IdCardPreview2 />
      <IdCardPreview3 />
      <IdCardPreview4 />
      <div className="absolute flex h-[7px] items-center justify-center left-[128.74px] top-[143.74px] w-[27.527px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <IdCardPreview5 />
        </div>
      </div>
      <Group />
    </div>
  );
}