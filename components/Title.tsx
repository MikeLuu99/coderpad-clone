interface TitleProps {
  children: string;
}

export default function Title(props: TitleProps): JSX.Element {
  return <h1 className="text-xl font-bold text-black">{props.children}</h1>;
}
