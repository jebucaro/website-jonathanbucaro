#!/bin/sh
# Rebuilds git's SSH allowed signers file from the copied .gitconfig instead of
# bind-mounting the host's, which contributors and Codespaces don't have.
# Does nothing unless git is set up to sign with an SSH key.
set -eu

[ "$(git config --global gpg.format || true)" = ssh ] || exit 0
key="$(git config --global user.signingkey || true)"
key="${key#key::}"
case "$key" in "~/"*) key="$HOME/${key#\~/}" ;; esac
if [ -f "$key" ]; then key="$(cat "$key" 2>/dev/null)" || exit 0; fi
case "$key" in ssh-* | ecdsa-* | sk-*) ;; *) exit 0 ;; esac
email="$(git config --global user.email)" || exit 0
nl='
'
case "$email$key" in *"$nl"*) exit 0 ;; esac

file="$HOME/.ssh/allowed_signers"
mkdir -p "$HOME/.ssh"
rm -f "$file"
printf '%s %s\n' "$email" "$key" >"$file"
git config --global gpg.ssh.allowedSignersFile "$file"
