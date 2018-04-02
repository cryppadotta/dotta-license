import { css } from 'styled-components';
import theme from './theme';

export const FormStyles = css`
  input,
  select,
  button,
  .btn {
    background-color: transparent;
    border: 1px solid black;
    color: black;
    border-radius: 3px;
    display: block;
    width: 100%;
    font-family: ${theme.fontFamilyMonospace};
    font-size: 16px;
    box-sizing: border-box;

    &.error {
      border: 1px solid red;
    }

    &:disabled {
      border: 1px solid #848484;
      color: #848484;
    }
  }

  .btn {
    padding: 0.3em 0em;
    width: 100%;
    height: 42px;
    font-size: 1.2rem;
    text-align: center;
    border-radius: 5px;
    text-decoration: none;
  }

  input,
  select {
    height: 30px;
  }

  input {
    padding: 0 0.4em;
  }

  label {
    display: block;
    padding-bottom: 0.4em;
  }

  select {
  }

  .form-group {
    padding-bottom: 1.6em;
    &.last {
      padding-bottom: 0;
    }
  }

  button {
    padding: 0.3em 0em;
    font-size: 1.4rem;
    border-radius: 5px;
    width: 80%;
    margin: 0 auto;
    cursor: pointer;
  }

  .muted {
    padding-top: 2px;
    font-size: 0.8em;
    color: #8e8e8e;
    font-style: italic;
    text-align: right;
    a {
      color: #8e8e8e;
      text-decoration: none;
    }
  }

  .errorMsg {
    color: red;
    font-size: 0.9em;
    margin-bottom: 0;
    margin-top: 0.5em;
  }
`;
