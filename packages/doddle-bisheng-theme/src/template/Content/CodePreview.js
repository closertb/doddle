import React from 'react';
import { Modal, Tooltip } from 'antd';
import { ArrowsAltOutline, DownSquareOutline } from '@ant-design/icons';

const noop = () => {};

export default class CodePreview extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      codeExpand: true,
    };
    this.codeCon = React.createRef();
    this.handleCodeExpand = this.handleCodeExpand.bind(this);
    this.fullscreenPreview = this.fullscreenPreview.bind(this);
  }
  fullscreenPreview() {
    const { title, children } = this.props;
    Modal.info({
      title,
      content: children,
      iconType: 'code-o',
      width: '90%',
      okText: '关闭',
      onOk: noop,
      onCancel: noop,
      maskClosable: true,
    });
  }
  handleCodeExpand() {
    const { codeExpand } = this.state;
    this.setState({
      codeExpand: !codeExpand,
    });
  }
  render() {
    const { children } = this.props;
    const { codeExpand } = this.state;
    const codePreviewClass = codeExpand
      ? 'code-preview'
      : 'code-preview-expand';
    return (
      <div className="demo-code-preview">
        <div className="ctrl">
          <Tooltip placement="left" title="全屏查看">
            <span onClick={this.fullscreenPreview}>
              <ArrowsAltOutline />
            </span>
          </Tooltip>
          <Tooltip placement="right" title="查看代码">
            <span onClick={this.handleCodeExpand}>
              <DownSquareOutline />
            </span>
          </Tooltip>
        </div>
        <div className={codePreviewClass} ref={this.codeCon}>
          {children}
        </div>
      </div>
    );
  }
}
