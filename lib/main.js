/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Provider} from 'nuclide-quick-open/lib/types';

import { HoundProvider } from './HoundProvider';

export function registerProvider(): Provider {
  return HoundProvider;
}
