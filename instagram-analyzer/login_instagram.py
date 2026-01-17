#!/usr/bin/env python3
"""
Script para fazer login no Instagram e salvar sessão
Execute no Terminal: python3 login_instagram.py
"""

import instaloader
import getpass
import os

USERNAME = 'nextleveldj1'

def main():
    print(f"\n=== Login Instagram @{USERNAME} ===\n")

    L = instaloader.Instaloader()

    # Verifica se já existe sessão
    session_file = os.path.expanduser(f'~/.config/instaloader/session-{USERNAME}')

    if os.path.exists(session_file):
        print(f"Sessão existente encontrada: {session_file}")
        try:
            L.load_session_from_file(USERNAME, session_file)
            # Testa se sessão é válida
            profile = instaloader.Profile.from_username(L.context, USERNAME)
            print(f"✓ Sessão válida! Logado como @{profile.username}")
            print(f"  Posts: {profile.mediacount}")
            print(f"  Seguidores: {profile.followers}")
            return
        except Exception as e:
            print(f"Sessão expirada ou inválida: {e}")
            print("Fazendo novo login...\n")

    # Pede senha
    password = getpass.getpass(f"Digite a senha de @{USERNAME}: ")

    try:
        L.login(USERNAME, password)
        print(f"\n✓ Login bem sucedido!")

        # Salva sessão
        L.save_session_to_file(USERNAME)
        print(f"✓ Sessão salva em: {session_file}")

        # Testa acesso
        profile = instaloader.Profile.from_username(L.context, USERNAME)
        print(f"\nPerfil: @{profile.username}")
        print(f"Posts totais: {profile.mediacount}")

        print("\n=== Pronto! Agora você pode buscar todos os vídeos ===")

    except instaloader.exceptions.BadCredentialsException:
        print("\n✗ Senha incorreta!")
    except instaloader.exceptions.TwoFactorAuthRequiredException:
        print("\n⚠ Autenticação de 2 fatores necessária!")
        code = input("Digite o código 2FA: ")
        try:
            L.two_factor_login(code)
            L.save_session_to_file(USERNAME)
            print(f"✓ Login com 2FA bem sucedido! Sessão salva.")
        except Exception as e:
            print(f"✗ Erro no 2FA: {e}")
    except Exception as e:
        print(f"\n✗ Erro: {e}")

if __name__ == '__main__':
    main()
