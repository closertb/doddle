import React from 'react';
import DocumentTitle from 'react-document-title';
import Layout from './Layout';

const NotFound = props => (
  <DocumentTitle title={`Not Found | ${props.themeConfig.title}`}>
    <Layout {...props}>
      <h1 className="entry-title">404 Not Found!</h1>
    </Layout>
  </DocumentTitle>
);

export default React.memo(NotFound);
