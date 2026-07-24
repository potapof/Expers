#!/usr/bin/env pwsh
<#
  seed-test-data.ps1 — Наполнение БД тестовыми данными для Playwright E2E тестов
  Требует: curl, jq (или PowerShell-замена)
  Запуск: ./scripts/seed-test-data.ps1 [-BaseUrl "https://expers.ru"]
#>

param(
  [string]$BaseUrl = "https://expers.ru"
)

$ErrorActionPreference = "Stop"

function Invoke-Api {
  param([string]$Method, [string]$Path, $Body, [string]$Token)
  $headers = @{ "Content-Type" = "application/json" }
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }

  $args = @{
    Uri             = "$BaseUrl$Path"
    Method          = $Method
    Headers         = $headers
    SkipCertificateCheck = $true
    ErrorVariable    = "err"
    ErrorAction     = "SilentlyContinue"
  }
  if ($Body) { $args["Body"] = ($Body | ConvertTo-Json -Depth 20 -Compress) }

  $r = Invoke-RestMethod @args
  return $r
}

Write-Host "=== Шаг 1: Регистрация тестовых пользователей ==="

Write-Host "Регистрация читателя..."
try {
  $r = Invoke-Api -Method Post -Path "/api/auth/register" -Body @{
    name = "Тестовый Читатель"; email = "reader@test.expers.ru"; password = "test123456"
  }
  Write-Host "  OK: $($r.expert.email)"
} catch {
  if ($_.Exception.Response.StatusCode -eq 409) { Write-Host "  Уже существует" }
  else { Write-Host "  ОШИБКА: $_" }
}

Write-Host "Регистрация автора..."
try {
  $r = Invoke-Api -Method Post -Path "/api/auth/register" -Body @{
    name = "Тестовый Автор"; email = "author@test.expers.ru"; password = "test123456"
  }
  Write-Host "  OK: $($r.expert.email)"
} catch {
  if ($_.Exception.Response.StatusCode -eq 409) { Write-Host "  Уже существует" }
  else { Write-Host "  ОШИБКА: $_" }
}

Write-Host "Регистрация админа..."
try {
  $r = Invoke-Api -Method Post -Path "/api/auth/register" -Body @{
    name = "Админ Тестовый"; email = "admin@test.expers.ru"; password = "admin123"
  }
  Write-Host "  OK: $($r.expert.email)"
} catch {
  if ($_.Exception.Response.StatusCode -eq 409) { Write-Host "  Уже существует" }
  else { Write-Host "  ОШИБКА: $_" }
}

Write-Host "=== Шаг 2: Получение JWT-токенов ==="

$readerLogin = Invoke-Api -Method Post -Path "/api/auth/login" -Body @{
  email = "reader@test.expers.ru"; password = "test123456"
}
$READER_TOKEN = $readerLogin.token
Write-Host "READER_TOKEN: $($READER_TOKEN.Substring(0,20))..."

$authorLogin = Invoke-Api -Method Post -Path "/api/auth/login" -Body @{
  email = "author@test.expers.ru"; password = "test123456"
}
$AUTHOR_TOKEN = $authorLogin.token
$AUTHOR_ID = $authorLogin.expert.id
Write-Host "AUTHOR_TOKEN: $($AUTHOR_TOKEN.Substring(0,20))..."

$adminLogin = Invoke-Api -Method Post -Path "/api/auth/login" -Body @{
  email = "admin@test.expers.ru"; password = "admin123"
}
$ADMIN_TOKEN = $adminLogin.token
Write-Host "ADMIN_TOKEN: $($ADMIN_TOKEN.Substring(0,20))..."

Write-Host "=== Шаг 3: Создание 4 тестовых статей ==="

$article1 = @{
  title = "Как ИИ меняет автоматизацию производства в 2026 году"
  description = "Искусственный интеллект трансформирует производственные линии. От предиктивного обслуживания до цифровых двойников — разбираем ключевые тренды."
  content = "## Введение`nПромышленность переживает четвёртую революцию...`n`n## Анализ`nПо данным McKinsey, внедрение ИИ сокращает простои на 30-50%...`n`n## Выводы`nКомпании, инвестирующие в ИИ-автоматизацию, получают конкурентное преимущество..."
  industryId = "proizvodstvo"; industryName = "Производство"
  subsectionId = "manufacturing-automation"; subsectionName = "Автоматизация производства"
  categoryId = "ai-in-manufacturing"; categoryName = "ИИ в производстве"
  expertiseAreas = @("Искусственный интеллект", "Промышленная автоматизация", "Цифровая трансформация")
  tldr = "ИИ сокращает простои на 30-50% и повышает OEE на 15-25%. Внедрение окупается за 8-14 месяцев."
  keyFacts = @(
    @{icon="chart"; text="50% производственных компаний уже используют ИИ"},
    @{icon="zap"; text="Сокращение простоев на 30-50% по данным McKinsey"},
    @{icon="tool"; text="Окупаемость: 8-14 месяцев"}
  )
  definition = "ИИ-автоматизация производства — внедрение алгоритмов машинного обучения в производственные процессы для оптимизации операций, предиктивного обслуживания и контроля качества."
  featuredSnippet = @{
    question = "Как ИИ применяется в автоматизации производства?"
    answer = "ИИ используется для предиктивного обслуживания оборудования, компьютерного зрения для контроля качества, оптимизации цепочек поставок и управления цифровыми двойниками производственных линий."
  }
  problemSolutionResult = @{
    problem = "Простои оборудования обходятся производству в миллионы рублей ежегодно. Традиционные методы обслуживания не предсказывают поломки."
    solution = "Внедрение предиктивного обслуживания на базе машинного обучения и IoT-датчиков."
    result = "Сокращение внеплановых простоев на 30-50%, экономия до 15 млн руб/год на одну линию."
  }
  howTo = @(
    @{title="Аудит производственных процессов"; description="Определите узкие места и точки сбора данных на линии."},
    @{title="Установка IoT-датчиков"; description="Подключите датчики вибрации, температуры, давления к критическому оборудованию."},
    @{title="Внедрение ML-модели"; description="Обучите модель на исторических данных для предсказания отказов."}
  )
  faq = @(
    @{question="Сколько стоит внедрение ИИ на производстве?"; answer="Базовое решение для одной линии — от 2 до 10 млн рублей в зависимости от сложности."},
    @{question="Какие производства выигрывают больше всего?"; answer="Нефтехимия, металлургия, автомобилестроение — где дорогое оборудование и высокая цена простоя."}
  )
  methodology = "На основе отчётов McKinsey, Deloitte, Gartner за 2025-2026 и кейсов внедрения на российских предприятиях."
  sources = @(
    @{title="McKinsey — AI in Manufacturing 2026"; url="https://www.mckinsey.com/ai-manufacturing"},
    @{title="Deloitte — Smart Factory Report"; url="https://www.deloitte.com/smart-factory"}
  )
  slug = "kak-ii-menyaet-avtomatizatsiyu-proizvodstva-v-2026-godu"
}
Write-Host "Создание статьи 1 (Производство)..."
$r1 = Invoke-Api -Method Post -Path "/api/articles" -Body $article1 -Token $AUTHOR_TOKEN
$ARTICLE1_ID = $r1.id ?? $r1.article?.id
Write-Host "  ID: $ARTICLE1_ID"

$article2 = @{
  title = "Цифровой рубль и будущее розничного банкинга"
  description = "Третья форма национальной валюты меняет банковский ландшафт. Как цифровой рубль повлияет на розничные банки и их клиентов."
  content = "## Введение`nС 2025 года цифровой рубль — третья форма денег в России...`n`n## Влияние на банки`nКоммерческие банки теряют часть комиссионных доходов..."
  industryId = "finansy"; industryName = "Финансы"
  subsectionId = "digital-currency"; subsectionName = "Цифровая валюта"
  categoryId = "digital-ruble"; categoryName = "Цифровой рубль"
  expertiseAreas = @("Финтех", "Банковское дело", "Цифровые валюты")
  tldr = "Цифровой рубль снизит комиссии банков на 40-60 млрд руб/год. Победят банки, инвестирующие в открытые API и необанкинг."
  keyFacts = @(
    @{icon="chart"; text="15 банков участвуют в пилоте ЦФА с 2025"},
    @{icon="zap"; text="Снижение комиссионных доходов банков: 40-60 млрд руб/год"},
    @{icon="target"; text="85% розничных клиентов готовы использовать цифровой рубль"}
  )
  definition = "Цифровой рубль — третья форма национальной валюты РФ, выпускаемая Банком России в цифровом виде."
  featuredSnippet = @{
    question = "Что такое цифровой рубль и зачем он нужен?"
    answer = "Цифровой рубль — третья форма рубля наряду с наличной и безналичной. Выпускается Банком России для снижения транзакционных издержек."
  }
  problemSolutionResult = @{
    problem = "Розничные банки теряют до 30% комиссионных доходов из-за перехода клиентов на цифровой рубль."
    solution = "Внедрение открытых API (Open Banking), развитие необанкинга и встроенных финансов."
    result = "Банки с Open API: рост клиентской базы на 25-40%, компенсация потерь через цифровые продукты."
  }
  howTo = @(
    @{title="Оценить потери от цифрового рубля"; description="Проанализируйте долю комиссионных доходов, подверженных риску."},
    @{title="Внедрить Open API"; description="Подключитесь к платформе ЦБ и откройте API для финтех-партнёров."},
    @{title="Разработать необанк-продукты"; description="Запустите цифровые кошельки, встроенные финансы."}
  )
  faq = @(
    @{question="Цифровой рубль — это криптовалюта?"; answer="Нет. Цифровой рубль централизован, выпускается и контролируется Банком России."},
    @{question="Заменит ли цифровой рубль наличные?"; answer="Нет, это дополнительная форма денег. Наличные останутся в обращении."}
  )
  methodology = "На основе материалов Банка России (2025-2026), отчётов АКРА, Эксперт РА и международного опыта."
  sources = @(
    @{title="Банк России — Цифровой рубль"; url="https://cbr.ru/digital-ruble"},
    @{title="АКРА — Влияние CBDC на банки"; url="https://acra-ratings.ru/cbdc"}
  )
  slug = "tsifrovoj-rubl-i-buduschee-roznichnogo-bankinga"
}
Write-Host "Создание статьи 2 (Финансы)..."
$r2 = Invoke-Api -Method Post -Path "/api/articles" -Body $article2 -Token $AUTHOR_TOKEN
$ARTICLE2_ID = $r2.id ?? $r2.article?.id
Write-Host "  ID: $ARTICLE2_ID"

$article3 = @{
  title = "Телемедицина в России: законодательство и практика 2026"
  description = "Рынок телемедицины в России вырос в 4 раза за 3 года. Разбираем закон № 482-ФЗ, новые правила ЭПР и практику применения."
  content = "## Введение`nТелемедицина в России прошла путь от экспериментов до отраслевого стандарта...`n`n## Законодательная база`nФедеральный закон № 482-ФЗ и постановления Правительства..."
  industryId = "zdravohranenie"; industryName = "Здравоохранение"
  subsectionId = "telemedicine"; subsectionName = "Телемедицина"
  categoryId = "telemedicine-law"; categoryName = "Законодательство"
  expertiseAreas = @("Медицинское право", "Телемедицина", "Цифровое здравоохранение")
  tldr = "Рынок телемедицины РФ вырос до 96 млрд руб к 2026. Закон № 482-ФЗ разрешил дистанционную постановку диагноза."
  keyFacts = @(
    @{icon="chart"; text="Рынок телемедицины РФ: 96 млрд руб в 2026 (рост 4x за 3 года)"},
    @{icon="eye"; text="№ 482-ФЗ разрешил дистанционный диагноз в рамках ЭПР"},
    @{icon="zap"; text="90% частных клиник уже используют телемедицинские сервисы"}
  )
  definition = "Телемедицина — оказание медицинских услуг с использованием информационно-коммуникационных технологий."
  featuredSnippet = @{
    question = "Разрешена ли постановка диагноза через телемедицину в России?"
    answer = "Да, с 2026 года в рамках экспериментального правового режима (ЭПР)."
  }
  problemSolutionResult = @{
    problem = "Врачи и клиники боятся юридических рисков при дистанционной постановке диагноза."
    solution = "Чёткое следование протоколам ЭПР, сертифицированные платформы, страхование ответственности."
    result = "Снижение нагрузки на поликлиники на 30-40%, рост удовлетворённости пациентов на 25%."
  }
  howTo = @(
    @{title="Получить лицензию на телемедицину"; description="Подайте заявление в Росздравнадзор."},
    @{title="Выбрать сертифицированную платформу"; description="Платформа должна быть в реестре отечественного ПО."}
  )
  faq = @(
    @{question="Нужна ли отдельная лицензия на телемедицину?"; answer="Да, требуется медицинская лицензия с указанием «телемедицинские консультации»."},
    @{question="Можно ли выписывать электронные рецепты?"; answer="Да, с 2025 года разрешена выписка электронных рецептов."}
  )
  methodology = "На основе ФЗ № 323-ФЗ, № 482-ФЗ, приказов Минздрава, отчётов Data Insight."
  sources = @(
    @{title="Федеральный закон № 482-ФЗ"; url="https://docs.cntd.ru/482-fz"},
    @{title="Data Insight — Телемедицина 2026"; url="https://datainsight.ru/telemed-2026"}
  )
  slug = "telemeditsina-v-rossii-zakonodatelstvo-i-praktika-2026"
}
Write-Host "Создание статьи 3 (Здравоохранение)..."
$r3 = Invoke-Api -Method Post -Path "/api/articles" -Body $article3 -Token $AUTHOR_TOKEN
$ARTICLE3_ID = $r3.id ?? $r3.article?.id
Write-Host "  ID: $ARTICLE3_ID"

$article4 = @{
  title = "EdTech 2026: как AI-тьюторы меняют школьное образование"
  description = "Персонализированное обучение с ИИ перестало быть экспериментом. Как AI-тьюторы внедряются в российские школы."
  content = "## Введение`nК 2026 году 40% российских школ используют элементы ИИ-обучения...`n`n## Анализ`nПерсонализированные траектории обучения показывают рост успеваемости на 20-35%..."
  industryId = "obrazovanie"; industryName = "Образование"
  subsectionId = "edtech"; subsectionName = "EdTech"
  categoryId = "ai-in-edu"; categoryName = "ИИ в образовании"
  expertiseAreas = @("EdTech", "Образовательные технологии", "Искусственный интеллект")
  tldr = "AI-тьюторы повышают успеваемость на 20-35% при снижении нагрузки на учителей. 40% школ РФ уже используют элементы ИИ."
  keyFacts = @(
    @{icon="chart"; text="40% школ РФ используют ИИ-инструменты"},
    @{icon="zap"; text="Рост успеваемости: 20-35%"},
    @{icon="star"; text="Снижение нагрузки на учителей: 30%"}
  )
  definition = "AI-тьютор — система персонализированного обучения на базе искусственного интеллекта."
  featuredSnippet = @{
    question = "Что такое AI-тьютор и как он работает?"
    answer = "AI-тьютор — это образовательная платформа с ИИ, которая анализирует ответы ученика и адаптирует учебную программу."
  }
  problemSolutionResult = @{
    problem = "Учителя перегружены проверкой работ и не успевают уделять внимание отстающим ученикам."
    solution = "Внедрение AI-тьюторов для автоматической проверки заданий и построения индивидуальных траекторий."
    result = "Успеваемость растёт на 20-35%. Учителя экономят 10-15 часов в неделю на проверке."
  }
  howTo = @(
    @{title="Провести аудит IT-инфраструктуры школы"; description="Проверьте наличие планшетов/ноутбуков, качество Wi-Fi."},
    @{title="Выбрать AI-тьютор-платформу"; description="Сравните Учи.ру, Яндекс.Учебник, СберКласс, SkySmart."}
  )
  faq = @(
    @{question="Заменят ли AI-тьюторы учителей?"; answer="Нет. AI-тьютор берёт на себя рутину, освобождая учителя для творческой работы."}
  )
  methodology = "На основе данных Минпросвещения РФ (2025-2026), исследований НИУ ВШЭ."
  sources = @(
    @{title="Минпросвещения — Цифровая школа 2026"; url="https://edu.gov.ru/digital-school"},
    @{title="НИУ ВШЭ — ИИ в школьном образовании"; url="https://www.hse.ru/ai-in-edu"}
  )
  slug = "edtech-2026-kak-ai-tutory-menyaut-shkolnoe-obrazovanie"
}
Write-Host "Создание статьи 4 (Образование)..."
$r4 = Invoke-Api -Method Post -Path "/api/articles" -Body $article4 -Token $AUTHOR_TOKEN
$ARTICLE4_ID = $r4.id ?? $r4.article?.id
Write-Host "  ID: $ARTICLE4_ID"

Write-Host "=== Шаг 4: Проверка результата ==="
Write-Host "Статей автора:"
$mine = Invoke-Api -Method Get -Path "/api/articles?mine=true" -Token $AUTHOR_TOKEN
Write-Host "  $($mine.articles.Count ?? $mine.articles.Length)"

Write-Host "Статей в каталоге:"
$catalog = Invoke-Api -Method Get -Path "/api/articles"
Write-Host "  $($catalog.articles.Count ?? $catalog.articles.Length)"

Write-Host ""
Write-Host "=== ГОТОВО ==="
Write-Host "ARTICLE1_ID=$ARTICLE1_ID"
Write-Host "ARTICLE2_ID=$ARTICLE2_ID"
Write-Host "ARTICLE3_ID=$ARTICLE3_ID"
Write-Host "ARTICLE4_ID=$ARTICLE4_ID"
Write-Host "READER_TOKEN=$READER_TOKEN"
Write-Host "AUTHOR_TOKEN=$AUTHOR_TOKEN"
Write-Host "ADMIN_TOKEN=$ADMIN_TOKEN"
