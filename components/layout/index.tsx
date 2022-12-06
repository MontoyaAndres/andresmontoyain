import { ChangeEvent, ReactNode, useState } from "react";
import Link from "next/link";

import { GitHub, Krebit, Sun } from "../icons";
import { Twitter } from "../icons/twitter";

interface IProps {
  children: ReactNode;
}

interface IValues {
  search?: string;
}

export const Layout = (props: IProps) => {
  const { children } = props;
  const [values, setValues] = useState<IValues>();
  const [shouldExpandInput, setShouldExpandInput] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleShouldExpandInput = (value: boolean) => {
    setShouldExpandInput(value);
  };

  const handleFeedback = () => {
    const title = "Issue with page/post";
    const body = `
I found something wrong on this page:

${window.location.href}

Here's what it is:
    `;

    const url = `https://github.com/MontoyaAndres/andresmontoyain/issues/new?title=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(body)}`;

    window.open(url, "_blank");
  };

  return (
    <>
      <style jsx global>{`
        .navbar {
          position: sticky;
          top: 0;
          right: 0;
          left: 0;
          background-color: var(--primary-color);
          box-shadow: var(--shadow-smallest);
          width: 100%;
          height: 50px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          @media (min-width: 1024px) {
            padding: 0 40px;
          }

          .is-hidden {
            display: none;

            @media (min-width: 1024px) {
              display: block;
            }
          }

          .navbar-left {
            height: 100%;
            display: flex;
            align-items: center;
            grid-gap: 10px;
            position: relative;

            @media (min-width: 1024px) {
              grid-gap: 30px;
            }

            .navbar-left-text {
              margin: 0;
              font-size: var(--font-base);
              font-weight: 500;
              color: var(--white-color);
            }

            .navbar-left-input {
              height: 35px;
              width: 150px;
              border: 1px solid var(--primary-color);
              border-radius: 5px;
              background-color: var(--light-primary-color);
              transition: all 0.2s ease;

              &::placeholder {
                color: var(--secondary-color);
                font-size: var(--font-xs);
              }
            }

            .navbar-left-input.navbar-left-input-larger {
              position: absolute;
              right: 0;
              left: 0;
              width: 200px;

              @media (min-width: 1024px) {
                position: initial;
                width: 150px;
              }
            }
          }

          .navbar-right {
            display: flex;
            grid-gap: 5px;

            .navbar-right-item {
              background-color: var(--light-secondary-color);
              height: 50px;
              width: 60px;
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;

              & > p {
                font-size: var(--font-sm);
                font-weight: 500;
                color: var(--white-color);
              }

              & > svg {
                width: 20px;
                height: 20px;
                fill: var(--white-color);
              }
            }
          }
        }

        .footer {
          display: flex;
          position: absolute;
          bottom: 0;
          right: 0;
          left: 0;
          background-color: var(--primary-color);
          box-shadow: var(--shadow-smallest);
          width: 100%;
          height: 100px;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          grid-gap: 20px;

          @media (min-width: 1024px) {
            height: 60px;
            flex-direction: initial;
            justify-content: space-between;
            grid-gap: initial;
          }

          .footer-left {
            .footer-left-title {
              margin: 0;
              font-size: var(--font-base);
              font-weight: 500;
              color: var(--white-color);
              text-decoration: underline;
              cursor: pointer;
            }
          }

          .footer-right {
            display: flex;
            grid-gap: 20px;

            .footer-right-item {
              width: 25px;
              height: 25px;
              cursor: pointer;

              & > svg {
                width: 25px;
                height: 25px;
                fill: var(--white-color);
              }
            }
          }
        }
      `}</style>
      <nav className="navbar">
        <div className="navbar-left">
          <Link href="/">
            <p className="navbar-left-text">Home</p>
          </Link>
          <Link href="/articles" className="is-hidden">
            <p className="navbar-left-text">Articles</p>
          </Link>
          <p
            className="navbar-left-text is-hidden"
            onClick={() => handleFeedback()}
          >
            Feedback
          </p>
          <input
            name="search"
            value={values?.search || ""}
            onChange={handleChange}
            onBlur={() => handleShouldExpandInput(false)}
            onFocus={() => handleShouldExpandInput(true)}
            className={`navbar-left-input ${
              shouldExpandInput ? "navbar-left-input-larger" : ""
            }`}
            placeholder="Search..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
        <div className="navbar-right">
          <div className="navbar-right-item">
            <p>ES</p>
          </div>
          <div className="navbar-right-item">
            <Sun />
          </div>
        </div>
      </nav>
      {children}
      <footer className="footer">
        <div className="footer-left">
          <a
            className="footer-left-title"
            href="https://etherscan.io/address/0x7456ed43037820285e0f37708630cff2e78317f8"
            target="_blank"
          >
            andresmontoya.eth
          </a>
        </div>
        <div className="footer-right">
          <a
            className="footer-right-item"
            href="https://krebit.id/andresmontoya.eth"
            target="_blank"
          >
            <Krebit />
          </a>
          <a
            className="footer-right-item"
            href="https://app.orbis.club/profile/did:pkh:eip155:1:0x7456ed43037820285e0f37708630cff2e78317f8"
            target="_blank"
          >
            <img src="/orbis.png" width={25} height={25} />
          </a>
          <a
            className="footer-right-item"
            href="https://www.lensfrens.xyz/andresmontoya.lens"
            target="_blank"
          >
            <img src="/lens.png" width={25} height={25} />
          </a>
          <a
            className="footer-right-item"
            href="https://github.com/MontoyaAndres"
            target="_blank"
          >
            <GitHub />
          </a>
          <a
            className="footer-right-item"
            href="https://twitter.com/AndresMontoyaIN"
            target="_blank"
          >
            <Twitter />
          </a>
        </div>
      </footer>
    </>
  );
};
