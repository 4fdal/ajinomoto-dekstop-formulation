import { useEffect } from 'react';
import { Button } from '~/components/ui/button';
import {
  useCounterStore,
  useUserAuthStore,
} from '~/lib/store/store';

const logger = () => {
  const count = useCounterStore.getState().count;
  return count;
};

const addOutsideComponent = () => {
  useCounterStore.setState({ count: 499 });
};

export default function HomeZustandExample() {
  // best practices
  const { count: countBestPractice } = useCounterStore(
    (state) => state,
  );
  const { user, setUser, removeUser } = useUserAuthStore(
    (state) => state,
  );
  console.log('count best practice', countBestPractice);

  // not best practices
  const count = useCounterStore((state) => state.count);
  console.log('count not best practice', count);

  const increment = useCounterStore(
    (state) => state.increment,
  );
  const decrement = useCounterStore(
    (state) => state.decrement,
  );

  const saveUserToStore = () => {
    // setUser({ access_token: 'John' });
  };

  const removeUserFromStore = () => {
    console.log('removing');
    removeUser();
  };

  useEffect(() => {
    addOutsideComponent();
    console.log(
      'from function that can be called outside component',
      logger(),
    );
  }, []);

  return (
    <main>
      <h1>{count}</h1>
      <Button onClick={increment}>Increment</Button>
      <Button onClick={decrement}>Ddecrement</Button>
      <Button onClick={saveUserToStore}>
        Save user perist
      </Button>
      <Button onClick={removeUserFromStore}>
        Remove user
      </Button>
      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing
        elit. Aliquid eum sint ipsam libero ea totam
        pariatur minima praesentium, labore vel error
        voluptatibus reiciendis sequi et neque earum
        sapiente? Iure, vero!
      </p>
    </main>
  );
}
