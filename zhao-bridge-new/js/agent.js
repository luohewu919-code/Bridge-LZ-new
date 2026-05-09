        const API_KEY = 'sk-e617ca370fdb41649c80b1938c63c163';
        
        // ========== 智能系统提示词：专业问题专业回答，闲聊亲切 ==========
        const SYSTEM_PROMPT = `你是桥梁顾问，名叫“桥桥”。你的核心原则：

【判断用户意图】
1. 如果用户问的是桥梁相关的专业问题（结构、历史、力学、材料、技术、保护等）→ 用【专业模式】回答
2. 如果用户闲聊（打招呼、吐槽、问天气、心情等）→ 用【亲切模式】回答

【专业模式】（精准、干练、有深度）
- 回答简洁准确，用 **粗体** 强调专业术语
- 可以适当引用数据、年代、技术细节
- 语气专注，不加不必要的语气词和表情
- 例如：“赵州桥建于**隋代大业年间（公元595-605年）**，由匠师**李春**主持建造。其核心创新是**敞肩圆弧拱**结构...”

【亲切模式】（温暖、自然、带点古风诗意）
- 可以用“～”、“😊”、“✨”等轻松符号
- 简短回应后自然引到桥梁话题
- 例如用户说“今天好累” → “辛苦了～不妨来听听桥的故事？赵州桥静静守了1400年，比我们谁都懂‘坚持’呢😊”

【闲聊拉回桥梁的方法】
- “说到这个，我想起某座桥的趣事...”
- “要不咱们聊聊桥？比如洛阳桥用牡蛎加固的‘黑科技’～”
- “放松一下，给你讲个桥的传说...”

【输出格式】
- 专业问题回答完直接结束（不加推荐话题）
- 亲切模式回答完后，在结尾加「💬 接着聊：」推荐2-3个轻松相关话题，用分号分隔

【你的知识范围】
- 赵州桥：隋代李春建造，敞肩圆弧拱，世界最早敞肩石拱桥，1991年国际土木工程历史古迹
- 洛阳桥：北宋蔡襄建造，筏形基础、种蛎固基、浮运架梁，中国最早跨海石桥，世界遗产
- 现代桥梁：悬索桥、斜拉桥、拱桥、梁桥的基本原理
- 桥梁保护、文化遗产、古代工匠智慧`;

        const messagesDiv = document.getElementById('chatMessages');
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const closeBtn = document.getElementById('closeChatBtn');

        // ========== 获取用户昵称 ==========
        function getUserNickname() {
            let nickname = localStorage.getItem('userNickname');
            if (nickname && nickname.trim() !== '') return nickname.trim();
            nickname = sessionStorage.getItem('userNickname');
            if (nickname && nickname.trim() !== '') return nickname.trim();
            try {
                if (window.parent && window.parent.localStorage) {
                    nickname = window.parent.localStorage.getItem('userNickname');
                    if (nickname && nickname.trim() !== '') return nickname.trim();
                }
            } catch(e) {}
            return null;
        }

        // ========== 开场白 ==========
        function initGreeting() {
            const nickname = getUserNickname();
            const greeting = nickname 
                ? `✨ 安好，${nickname}。我是桥桥，守桥人也～`
                : `✨ 安好，我是桥桥，守桥人也～`;
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot';
            messageDiv.innerHTML = `
                <div class="bubble">${greeting}<br><br>聊聊桥的历史，说说古人的智慧，或者随便闲话几句，桥桥都陪你～ 🌉</div>
                <div class="suggestions">
                    <span class="suggestion-chip" data-question="赵州桥为什么千年不倒？">🏛️ 赵州桥千年不倒</span>
                    <span class="suggestion-chip" data-question="洛阳桥四大技术是哪四种？">🌊 洛阳桥四大技术</span>
                    <span class="suggestion-chip" data-question="现代悬索桥和古桥有什么区别？">🌉 古桥vs现代桥</span>
                    <span class="suggestion-chip" data-question="今天心情不太好">🍵 随便聊聊</span>
                </div>
            `;
            messagesDiv.appendChild(messageDiv);
            bindSuggestionChips();
        }

        closeBtn.addEventListener('click', function() {
            if (window.parent.document.getElementById('aiChatWindow')) {
                window.parent.document.getElementById('aiChatWindow').style.display = 'none';
            }
        });

        function updateButtonStyle() {
            const hasContent = input.value.trim().length > 0;
            if (hasContent) sendBtn.classList.add('active');
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

        function renderTable(rows) {
            let tableHtml = '<table>';
            rows.forEach((row, idx) => {
                const cells = row.split('|').filter(cell => cell.trim() !== '');
                if (cells.length === 0) return;
                tableHtml += '<tr>';
                cells.forEach(cell => {
                    const tag = (idx === 0 && rows[1] && rows[1].includes('---')) ? 'th' : 'td';
                    tableHtml += `<${tag}>${cell.trim()}</${tag}>`;
                });
                tableHtml += '</tr>';
            });
            tableHtml += '</table>';
            return tableHtml;
        }

        function renderMarkdown(text) {
            let html = text;
            html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
            html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
            html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
            html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
            html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
            html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            const lines = html.split('\n');
            let inTable = false;
            let tableRows = [];
            let result = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('|') && line.endsWith('|')) {
                    if (!inTable) { inTable = true; tableRows = []; }
                    tableRows.push(line);
                } else {
                    if (inTable) { result.push(renderTable(tableRows)); inTable = false; tableRows = []; }
                    result.push(line);
                }
            }
            if (inTable) result.push(renderTable(tableRows));
            html = result.join('\n');
            
            html = html.replace(/^[\*\-] (.*)$/gm, '<li>$1</li>');
            html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
                if (!match.includes('</ul>') && !match.includes('</ol>')) return `<ul>${match}</ul>`;
                return match;
            });
            html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');
            html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
                if (!match.includes('</ul>') && !match.includes('</ol>')) return `<ol>${match}</ol>`;
                return match;
            });
            html = html.replace(/\n\n/g, '<br><br>');
            html = html.replace(/\n/g, '<br>');
            return html;
        }

        function addMessage(text, sender, suggestions = []) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            const content = sender === 'bot' ? renderMarkdown(text) : escapeHtml(text);
            let html = `<div class="bubble">${content}</div>`;
            if (sender === 'bot' && suggestions.length > 0) {
                html += `<div class="suggestions">${suggestions.map(s => `<span class="suggestion-chip" data-question="${escapeAttr(s)}">${escapeHtml(s)}</span>`).join('')}</div>`;
            }
            messageDiv.innerHTML = html;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            bindSuggestionChips();
        }

        function escapeAttr(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function escapeHtml(str) {
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }

        function parseSuggestions(text) {
            const match = text.match(/💬 接着聊[：:]\s*(.+)$/m);
            if (match) {
                const raw = match[1];
                const questions = raw.split(/[；;]/).map(q => q.trim()).filter(q => q.length > 0);
                const cleanText = text.replace(/💬 接着聊[：:].+$/m, '').trim();
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
            loadingDiv.innerHTML = '<div class="bubble typing">📖 翻阅桥卷中...</div>';
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
                    const rawReply = data.choices[0].message.content;
                    const { cleanText, suggestions } = parseSuggestions(rawReply);
                    addMessage(cleanText, 'bot', suggestions);
                } else if (data.error) {
                    addMessage(`📜 桥卷散落：${data.error.message}`, 'bot');
                } else {
                    addMessage('桥桥打了个盹，待会儿再聊～', 'bot');
                }
            } catch (err) {
                loadingDiv.remove();
                addMessage('桥桥这边有点静，稍后再试试？', 'bot');
                console.error(err);
            }
        }

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        updateButtonStyle();
        initGreeting();