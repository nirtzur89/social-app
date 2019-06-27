import React, { Fragment } from 'react';
import spinner from './loading.png';

export default () => (
	<Fragment>
		<img src={spinner} style={{ width: '200px', margin: 'auto', display: 'block' }} alt="loading..." />
	</Fragment>
);
