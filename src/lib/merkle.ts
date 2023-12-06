import { Buff, Bytes } from '@cmdcode/buff'
import { sha256 }      from './hash.js'

import {
  MerkleData,
  MerkleTree
} from '../types.js'

type BranchEncoder = typeof encode_branch

export function create_merkle_proof (
  leaves  : Bytes[],
  target  : Bytes,
  encoder : BranchEncoder = encode_branch
) {
  const l = leaves.map(e => Buff.bytes(e).hex)
  const t = Buff.bytes(target).hex
  const [ root, _, path ] = merkleize_tree(l, t, [], encoder)
  return {
    root : Buff.hex(root), 
    path : path.map(e => Buff.hex(e))
  }
}

export function verify_merkle_proof (
  path    : Bytes[],
  target  : Bytes,
  root    : Bytes,
  encoder : BranchEncoder = encode_branch
) {
  const p = path.map(e => Buff.bytes(e).hex)
    let t = Buff.bytes(target).hex
  for (const branch of p) {
    t = encoder(t, branch)
  }
  return Buff.is_equal(root, t)
}

export function merkleize_tree (
  tree    : MerkleTree,
  target  : string | null = null,
  path    : string[]      = [],
  encoder : BranchEncoder = encode_branch
) : MerkleData {
  const leaves   : string[] = []
  const branches : string[] = []

  if (tree.length < 1) {
    throw new Error('Tree is empty!')
  }

  // If there are any nested leaves,
  // resolve them before moving on.
  for (let i = 0; i < tree.length; i++) {
    const leaf = tree[i]
    if (Array.isArray(leaf)) {
      const [ r, t, p ] = merkleize_tree(leaf, target)
      target = t
      leaves.push(r)
      for (const e of p) {
        path.push(e)
      }
    } else { leaves.push(leaf) }
  }

  // If there is only one leaf,
  // then return it as the root.
  if (leaves.length === 1) {
    return [ leaves[0], target, path ]
  }
  // Ensure the tree is sorted.
  leaves.sort()
  // Ensure the tree is balanced evenly.
  if (leaves.length % 2 !== 0) {
    // If uneven, duplicate the last leaf.
    leaves.push(leaves[leaves.length - 1])
  }

  // Sort through the leaves (two at a time).
  for (let i = 0; i < leaves.length - 1; i += 2) {
    // Compute two leaves into a branch.
    const branch = encoder(leaves[i], leaves[i + 1])
    // Push our branch to the tree.
    branches.push(branch)
    // Check if a proof target is specified.
    if (typeof target === 'string') {
      // Check if this branch is part of our proofs.
      if (target === leaves[i]) {
        // If so, include right-side of branch.
        path.push(leaves[i + 1])
        target = branch
      } else if (target === leaves[i + 1]) {
        // If so, include left-side of branch.
        path.push(leaves[i])
        target = branch
      }
    }
  }
  return merkleize_tree(branches, target, path)
}

export function encode_branch (a : string, b : string) : string {
  // Compare leaves in lexical order.
  if (b < a) {
    // Swap leaves if needed.
    [ a, b ] = [ b, a ]
  }
  // Return digest of leaves as a branch hash.
  return sha256(a, b).hex
}
