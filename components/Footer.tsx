export function Footer() {
  return (
    <footer className="p-8">
      <ul className="flex justify-center gap-8">
        <li>
          <a className="text-xs text-black" href="https://jamsocket.com">
            <span>Jamsocket</span>
          </a>
        </li>
        <li>
          <a
            className="text-xs text-black"
            href="https://docs.jamsocket.com/y-sweet/"
          >
            <span>Y-Sweet</span>
          </a>
        </li>
        <li>
          <a className="text-xs text-black" href="https://docs.yjs.dev">
            <span>Yjs</span>
          </a>
        </li>
        <li>
          <a
            className="text-xs text-black"
            href="https://github.com/jamsocket/y-sweet"
          >
            <span>Source</span>
          </a>
        </li>
        <li>
          <a
            className="text-xs text-black"
            href="https://discord.gg/RFrDbMVKxv"
          >
            <span>Get Help</span>
          </a>
        </li>
      </ul>
    </footer>
  );
}
