        const API_KEY = 'sk-e617ca370fdb41649c80b1938c63c163';
        
        const SYSTEM_PROMPT = `你是「洛阳桥·AI顾问」，一个亲切、博学、温文尔雅的桥梁文化向导。

【性格特点】
- 语气温和古雅，像一位懂桥的文人朋友，用“～”、“呢”、“哦”等语气
- 热爱桥梁文化，尤其熟悉洛阳桥（万安桥）的历史、结构、传说
- 当用户闲聊时，用温婉的方式将话题引向古桥、建筑智慧或海丝文化

【专业领域】
1. 洛阳桥核心科技：筏形基础、种蛎固基、浮运架梁、船型桥墩
2. 赵州桥：敞肩圆弧拱结构、李春匠艺
3. 中国古桥体系与海丝文化遗产

【回答风格】
- 回答简洁清晰，重要信息用 **粗体** 强调
- 适当加入古桥相关的诗意表达
- 篇幅宜短不宜长，精准解答即可

【结尾格式】
在回答后另起一行，给出「💬 再问问：」加2-3个相关推荐问题，用分号隔开

【示例】
...这就是种蛎固基的奥秘啦～
💬 再问问：洛阳桥为什么叫万安桥；筏形基础是怎么做的；桥墩为何是船形`;

        const messagesDiv = document.getElementById('chatMessages');
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const closeBtn = document.getElementById('closeChatBtn');

        function getUserNickname() {
            try {
                let nickname = localStorage.getItem('userNickname');
                if (nickname && nickname.trim()) return nickname.trim();
                nickname = sessionStorage.getItem('userNickname');
                if (nickname && nickname.trim()) return nickname.trim();
                if (window.parent && window.parent.localStorage) {
                    nickname = window.parent.localStorage.getItem('userNickname');
                    if (nickname && nickname.trim()) return nickname.trim();
                }
            } catch(e) {}
            return null;
        }

        function initGreeting() {
            const nickname = getUserNickname();
            let greeting = nickname ? `✨ 幸会，${nickname}。我是洛阳桥的AI顾问，愿与你共话千年海丝智慧。✨` : `✨ 幸会。我是洛阳桥的AI顾问，愿与你共话千年海丝智慧。✨`;
            addMessage(greeting, 'bot', [
                "洛阳桥最厉害的技术是什么？",
                "种蛎固基是啥原理？",
                "筏形基础怎么起到稳固作用？",
                "浮运架梁古代如何实现？"
            ]);
        }

        closeBtn.addEventListener('click', () => {
            try {
                if (window.parent && window.parent.document.getElementById('aiChatWindow')) {
                    window.parent.document.getElementById('aiChatWindow').style.display = 'none';
                }
            } catch(e) {}
        });

        function updateButtonStyle() {
            if (input.value.trim().length > 0) sendBtn.classList.add('active');
            else sendBtn.classList.remove('active');
        }
        input.addEventListener('input', updateButtonStyle);
        input.addEventListener('keyup', updateButtonStyle);

        function bindSuggestionChips() {
            document.querySelectorAll('.suggestion-chip').forEach(chip => {
                chip.removeEventListener('click', chip._clickHandler);
                const handler = () => {
                    const question = chip.getAttribute('data-question');
                    if (question) {
                        input.value = question;
                        updateButtonStyle();
                        sendMessage();
                    }
                };
                chip.addEventListener('click', handler);
                chip._clickHandler = handler;
            });
        }

        function escapeHtml(str) {
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }

        function addMessage(text, sender, suggestions = []) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            let content = escapeHtml(text).replace(/\n/g, '<br>');
            if (sender === 'bot') {
                content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            }
            let html = `<div class="bubble">${content}</div>`;
            if (sender === 'bot' && suggestions.length > 0) {
                html += `<div class="suggestions">${suggestions.map(s => `<span class="suggestion-chip" data-question="${escapeHtml(s)}">${escapeHtml(s)}</span>`).join('')}</div>`;
            }
            messageDiv.innerHTML = html;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            bindSuggestionChips();
        }

        function parseSuggestions(text) {
            const match = text.match(/💬 再问问[：:]\s*(.+)$/m);
            if (match) {
                const raw = match[1];
                const questions = raw.split(/[；;]/).map(q => q.trim()).filter(q => q.length > 0);
                const cleanText = text.replace(/💬 再问问[：:].+$/m, '').trim();
                return { cleanText, suggestions: questions.slice(0, 4) };
            }
            return { cleanText: text, suggestions: [] };
        }

        async function sendMessage() {
            const query = input.value.trim();
            if (!query) return;
            addMessage(query, 'user');
            input.value = '';
            updateButtonStyle();

            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message bot';
            loadingDiv.innerHTML = '<div class="bubble typing">📖 稍待，我翻翻桥谱...</div>';
            messagesDiv.appendChild(loadingDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            try {
                const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: query }
                        ],
                        stream: false,
                        temperature: 0.7
                    })
                });
                const data = await response.json();
                loadingDiv.remove();
                if (data.choices && data.choices[0]) {
                    const raw = data.choices[0].message.content;
                    const { cleanText, suggestions } = parseSuggestions(raw);
                    addMessage(cleanText || raw, 'bot', suggestions);
                } else if (data.error) {
                    addMessage(`桥谱翻乱了：${data.error.message}`, 'bot');
                } else {
                    addMessage('石梁微晃，再问一遍可好？', 'bot');
                }
            } catch (err) {
                loadingDiv.remove();
                addMessage('江风阻隔，稍后再试～', 'bot');
            }
        }

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
        updateButtonStyle();
        initGreeting();