// eslint-disable-next-line no-use-before-define
import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { FletchContext, useCommit, useRetrieve } from './react';

const ChildComponent = ({ renderCounter }: { renderCounter: Function }) => {
  renderCounter();
  const name = useRetrieve('/name');
  const commit = useCommit();

  return (
    <>
      <h1>{ name || 'Default' }</h1>
      <button type="button" onClick={() => commit('/name', 'Another name')}>
        Click me.
      </button>
    </>
  );
};

const OtherChildComponent = ({ renderCounter }: { renderCounter: Function }) => {
  renderCounter();
  const name = useRetrieve('/name');

  return (
    <>
      <h1>{ name || 'Default 2' }</h1>
    </>
  );
};

const NonUpdatingChildComponent = ({ renderCounter }: { renderCounter: Function }) => {
  renderCounter();

  const othername = useRetrieve('/othername');

  return (
    <>
      <h1>{ othername || 'Yuh oh' }</h1>
    </>
  );
};

const NonUpdatingParentComponent = ({ children, renderCounter }: any) => {
  renderCounter();

  return (
    <>
      { children }
    </>
  );
};

const ParentComponent = ({
  parentRenderCounter, childRenderCounter, adjacentRenderCounter, otherChildRenderCounter,
}: any) => (
  <FletchContext>
    <NonUpdatingParentComponent renderCounter={parentRenderCounter}>
      <ChildComponent renderCounter={childRenderCounter} />
      <OtherChildComponent renderCounter={otherChildRenderCounter} />
      <NonUpdatingChildComponent renderCounter={adjacentRenderCounter} />
    </NonUpdatingParentComponent>
  </FletchContext>
);

describe('FletchContext', () => {
  it('updates on commit', async () => {
    const parentRenderCounter = jest.fn();
    const childRenderCounter = jest.fn();
    const adjacentRenderCounter = jest.fn();
    const otherChildRenderCounter = jest.fn();
    const { findAllByText, getByText } = render(<ParentComponent
      otherChildRenderCounter={otherChildRenderCounter}
      parentRenderCounter={parentRenderCounter}
      childRenderCounter={childRenderCounter}
      adjacentRenderCounter={adjacentRenderCounter}
    />);

    expect(getByText('Default')).toBeInTheDocument();

    fireEvent.click(getByText('Click me.'));

    const items = await findAllByText('Another name');
    expect(items).toHaveLength(2);
    expect(parentRenderCounter).toHaveBeenCalledTimes(1);
    expect(childRenderCounter).toHaveBeenCalledTimes(2);
    expect(otherChildRenderCounter).toHaveBeenCalledTimes(2);
    expect(adjacentRenderCounter).toHaveBeenCalledTimes(1);
  });
});

describe('useContext', () => {

});
