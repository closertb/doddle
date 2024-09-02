import SimpleVisible from './SimpleVisible';
import Custom from './Custom';

const Interactive: {
  Custom: typeof Custom;
  SimpleVisible: typeof SimpleVisible;
} = {
  Custom,
  SimpleVisible,
};

export default Interactive;
