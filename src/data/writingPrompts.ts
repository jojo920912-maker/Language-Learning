import type { WritingPrompt } from '@/types'

export const writingPrompts: WritingPrompt[] = [
  // ─── English (7) ───
  { id: 'wp-en-001', topic: 'Technology in Education', description: 'Discuss the advantages and disadvantages of using technology in modern education. Include specific examples.', language: 'en', difficulty: 'intermediate', wordLimit: 250, examType: 'TOEFL', sampleAnswer: 'Technology has revolutionized education in countless ways. Interactive whiteboards, online resources, and learning management systems have made education more accessible and engaging. However, over-reliance on technology can lead to shorter attention spans and reduced critical thinking. The key is finding balance — using technology as a tool to enhance learning, not replace traditional teaching methods.' },
  { id: 'wp-en-002', topic: 'Work-Life Balance', description: 'Some people believe that work should always come first, while others prioritize personal life. Discuss both views and give your own opinion.', language: 'en', difficulty: 'advanced', wordLimit: 300, examType: 'IELTS' },
  { id: 'wp-en-003', topic: 'The Importance of Learning a Second Language', description: 'Explain why learning a foreign language is valuable in today\'s world. Support your answer with reasons and examples.', language: 'en', difficulty: 'intermediate', wordLimit: 250, examType: 'TOEFL' },
  { id: 'wp-en-004', topic: 'Remote Work vs. Office Work', description: 'Do you think working from home is better than working in an office? Discuss the pros and cons and state your preference.', language: 'en', difficulty: 'intermediate', wordLimit: 280, examType: 'IELTS' },
  { id: 'wp-en-005', topic: 'A Memorable Trip', description: 'Describe a trip that was meaningful to you. Where did you go, what did you do, and why was it memorable?', language: 'en', difficulty: 'beginner', wordLimit: 200 },
  { id: 'wp-en-006', topic: 'Environmental Protection', description: 'What can individuals do to protect the environment? Give at least three specific suggestions.', language: 'en', difficulty: 'intermediate', wordLimit: 250, examType: 'TOEFL' },
  { id: 'wp-en-007', topic: 'Business Email: Requesting a Meeting', description: 'Write a professional email to a client requesting a meeting to discuss a new project. Include a proposed time and agenda.', language: 'en', difficulty: 'intermediate', wordLimit: 150, examType: 'TOEIC' },

  // ─── Japanese (7) ───
  { id: 'wp-ja-001', topic: '環境問題について', description: '現代社会における環境問題について、原因と解決策を含めて論じてください。', language: 'ja', difficulty: 'intermediate', wordLimit: 400, examType: 'JLPT_N2', sampleAnswer: '現代社会では、地球温暖化や海洋汚染など様々な環境問題が深刻化しています。その主な原因は、工業化による温室効果ガスの排出と、プラスチック製品の過剰使用です。解決のためには、再生可能エネルギーの普及と、個人レベルでの消費行動の見直しが必要です。' },
  { id: 'wp-ja-002', topic: '私の好きな場所', description: 'あなたの好きな場所について、その理由とともに紹介してください。', language: 'ja', difficulty: 'beginner', wordLimit: 200, examType: 'JLPT_N4', sampleAnswer: '私の好きな場所は家の近くの公園です。この公園には大きな桜の木があって、春になるととてもきれいです。私は週末によくここで散歩をしたり、本を読んだりします。' },
  { id: 'wp-ja-003', topic: '日本語を勉強する理由', description: 'あなたが日本語を勉強している理由と、将来どのように使いたいかを書いてください。', language: 'ja', difficulty: 'beginner', wordLimit: 200, examType: 'JLPT_N4' },
  { id: 'wp-ja-004', topic: 'スマートフォンと生活', description: 'スマートフォンは私たちの生活をどのように変えましたか。良い点と悪い点を述べてください。', language: 'ja', difficulty: 'intermediate', wordLimit: 350, examType: 'JLPT_N3' },
  { id: 'wp-ja-005', topic: '健康的な生活', description: '健康的な生活を送るために、あなたが心がけていることを書いてください。', language: 'ja', difficulty: 'beginner', wordLimit: 250, examType: 'JLPT_N3' },
  { id: 'wp-ja-006', topic: '仕事のメール：会議の案内', description: '取引先に来週の会議の日時と場所を知らせるビジネスメールを書いてください。', language: 'ja', difficulty: 'advanced', wordLimit: 200, examType: 'JLPT_N2' },
  { id: 'wp-ja-007', topic: '外国語学習の重要性', description: 'グローバル化が進む現代において、外国語を学ぶことの意義について論じてください。', language: 'ja', difficulty: 'advanced', wordLimit: 400, examType: 'JLPT_N1' },

  // ─── Korean (7) ───
  { id: 'wp-ko-001', topic: '소셜 미디어의 영향', description: '소셜 미디어가 현대 사회에 미치는 긍정적, 부정적 영향에 대해 써 보세요.', language: 'ko', difficulty: 'intermediate', wordLimit: 300, examType: 'TOPIK_II' },
  { id: 'wp-ko-002', topic: '나의 취미', description: '자신의 취미를 소개하고, 그 취미를 좋아하는 이유를 써 보세요.', language: 'ko', difficulty: 'beginner', wordLimit: 200, examType: 'TOPIK_I', sampleAnswer: '제 취미는 요리입니다. 주말마다 새로운 음식을 만들어 봅니다. 요리를 하면 스트레스가 풀리고 기분이 좋아집니다. 그리고 제가 만든 음식을 가족과 친구들이 맛있게 먹을 때 정말 행복합니다.' },
  { id: 'wp-ko-003', topic: '한국어를 배우는 이유', description: '한국어를 배우게 된 계기와 앞으로의 목표에 대해 써 보세요.', language: 'ko', difficulty: 'beginner', wordLimit: 200, examType: 'TOPIK_I' },
  { id: 'wp-ko-004', topic: '건강한 생활 습관', description: '건강을 지키기 위해 실천하고 있는 생활 습관에 대해 써 보세요.', language: 'ko', difficulty: 'intermediate', wordLimit: 300, examType: 'TOPIK_II' },
  { id: 'wp-ko-005', topic: '기억에 남는 여행', description: '가장 기억에 남는 여행에 대해 어디에 갔고 무엇을 했는지 써 보세요.', language: 'ko', difficulty: 'beginner', wordLimit: 250, examType: 'TOPIK_I' },
  { id: 'wp-ko-006', topic: '환경 보호', description: '환경을 보호하기 위해 개인이 할 수 있는 일을 세 가지 이상 제시하세요.', language: 'ko', difficulty: 'intermediate', wordLimit: 350, examType: 'TOPIK_II' },
  { id: 'wp-ko-007', topic: '인공지능과 미래', description: '인공지능 기술의 발전이 우리의 삶과 일자리에 어떤 영향을 줄지 논하세요.', language: 'ko', difficulty: 'advanced', wordLimit: 400, examType: 'TOPIK_II' },

  // ─── Chinese (7) ───
  { id: 'wp-zh-001', topic: '我的學習方法', description: '請介紹你學習外語的方法，並說明這些方法為什麼有效。', language: 'zh', difficulty: 'intermediate', wordLimit: 300, examType: 'HSK4', sampleAnswer: '學習外語最重要的是每天堅持練習。我每天早上背二十個生詞，晚上聽三十分鐘的廣播。我還喜歡看外語電影，一邊看一邊學習日常會話。遇到不懂的詞，我會馬上查詞典並記在筆記本上。' },
  { id: 'wp-zh-002', topic: '網路購物的利與弊', description: '網路購物越來越普及，請談談它的優點和缺點，並提出你的看法。', language: 'zh', difficulty: 'advanced', wordLimit: 400, examType: 'HSK5' },
  { id: 'wp-zh-003', topic: '我的家鄉', description: '請介紹你的家鄉，包括當地的特色、美食和你最喜歡的地方。', language: 'zh', difficulty: 'beginner', wordLimit: 200, examType: 'HSK3' },
  { id: 'wp-zh-004', topic: '手機對生活的影響', description: '智慧型手機改變了我們的生活方式，請談談它帶來的正面與負面影響。', language: 'zh', difficulty: 'intermediate', wordLimit: 300, examType: 'HSK4' },
  { id: 'wp-zh-005', topic: '一次難忘的經歷', description: '請描述一次讓你印象深刻的經歷，發生了什麼事，你有什麼感受。', language: 'zh', difficulty: 'beginner', wordLimit: 250, examType: 'HSK3' },
  { id: 'wp-zh-006', topic: '健康與運動', description: '運動對健康有什麼好處？請說明你平常如何保持健康的生活方式。', language: 'zh', difficulty: 'intermediate', wordLimit: 300, examType: 'HSK4' },
  { id: 'wp-zh-007', topic: '科技與人際關係', description: '科技的發展讓溝通更方便，但也可能讓人際關係變得疏遠，請談談你的看法。', language: 'zh', difficulty: 'advanced', wordLimit: 400, examType: 'HSK6' },
]
