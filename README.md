# IYFY CLUB — protótipo front-end

Protótipo navegável de uma plataforma de membros da IYFY Running, desenvolvido com HTML, CSS e JavaScript puro.

## Como executar
1. Extraia a pasta `iyfy-club`.
2. Abra a pasta no VS Code.
3. Abra `index.html` no navegador. Para desenvolvimento, recomenda-se a extensão **Live Server**.

## O que já está demonstrado
- Dashboard do membro
- Navegação entre áreas
- Feed da comunidade e criação local de publicação
- Curtidas demonstrativas
- Desafios e progresso ilustrativos
- Biblioteca de treinamento
- Benefícios e cópia de cupons demonstrativos
- Carteirinha digital e impressão
- Ranking ilustrativo
- Layout responsivo para desktop e celular

## Importante: protótipo, não sistema de produção
Esta versão funciona no navegador e usa conteúdo fictício/demonstrativo. Não possui:
- cadastro/login real ou recuperação de senha;
- banco de dados compartilhado;
- aprovação e gestão real de membros;
- integração com Strava;
- pagamentos/assinaturas;
- upload real de fotos;
- sincronização de atividades ou ranking verificável;
- painel administrativo persistente.

Essas funcionalidades exigem backend, banco de dados, autenticação, armazenamento de mídia e regras de segurança. Antes de lançar, será necessário definir o modelo de associação, política de privacidade, termos de uso e regras dos desafios.

## Próxima arquitetura sugerida
- Front-end: HTML/CSS/JS (ou migração gradual para React, se o produto crescer).
- Backend e autenticação: Supabase ou Firebase.
- Banco de dados: membros, posts, comentários, curtidas, desafios, atividades, benefícios e resgates.
- Armazenamento: fotos de perfil e publicações.
- Integração Strava: OAuth e API oficial, sujeita às permissões e limites da plataforma.
- Admin: gestão de membros, cupons, conteúdos e moderação.
