import { useLearningCopy } from '@/lib/learning-copy'
// Content adapted from docs/content-drafts/periodic-table-riddles.en.md (en-v1).
import { Link } from '@/i18n/routing'
import styles from './riddles.module.css'

export default function RiddlesArticle() {
    const t = useLearningCopy()

    return (
        <article className={styles.article}>
            <header className={styles.hero}>
                <p className={styles.eyebrow}>{t("THE ELEMENDLE FIELD GUIDE · 01")}</p>
                <h1>{t.rich("Periodic Table Riddles <tag0>with Answers</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h1>
                <div className={styles.intro}>
                    <p>{t("Can you recognize an element from its position, properties, or everyday uses? These 12 original riddles from Elemendle start with simple clues and work up to a few periodic-table surprises. Each answer includes an explanation so you can see how the clues fit together.")}</p>
                    <p>{t("Try each question before opening its answer. You can use a periodic table: the goal is to practice reasoning, not to memorize every element.")}</p>
                </div>
                <p className={styles.meta}>{t("12 original riddles")}<span aria-hidden="true">/</span>{t("3 difficulty levels")}<span aria-hidden="true">/</span>{t("Step-by-step explanations")}</p>
            </header>
            <section className={styles.before} aria-labelledby="before-you-start">
                <h2 id="before-you-start">{t("Before you start")}</h2>
                <ul>
                    <li>{t.rich("<tag0>Periods</tag0> are the horizontal rows. <tag1>Groups</tag1> are the vertical columns; this guide uses group numbers <tag2>1–18</tag2>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <strong>{chunks}</strong>, tag2: chunks => <strong>{chunks}</strong>})}</li>
                    <li>{t("Every answer is a chemical element. A clue may mention a compound containing that element, but the compound is not the answer.")}</li>
                    <li>{t("For physical-state clues, use the stated temperature and ordinary atmospheric pressure, approximately 1 atm. A gas clue refers to the element's usual gaseous form, such as O₂ for oxygen.")}</li>
                    <li>{t("Difficulty labels describe the kinds of reasoning involved. Move between sections whenever you like.")}</li>
                </ul>
                <p>{t.rich("The row and column conventions follow the standard layout explained in <tag0>OpenStax's periodic table guide</tag0>.", {tag0: chunks => <a href="https://openstax.org/books/chemistry-2e/pages/2-5-the-periodic-table">{chunks}</a>})}</p>
            </section>
            <nav className={styles.contents} aria-label={t("Guide contents")}>
                <p>{t("CHOOSE YOUR STARTING POINT")}</p>
                <ol>
                    <li><a href="#easy"><span>{t("01 / Easy")}</span><strong>{t("Find your way around the table")}</strong><span aria-hidden="true">↓</span></a></li>
                    <li><a href="#intermediate"><span>{t("02 / Intermediate")}</span><strong>{t("Combine the clues")}</strong><span aria-hidden="true">↓</span></a></li>
                    <li><a href="#challenge"><span>{t("03 / Challenge")}</span><strong>{t("Check the exceptions")}</strong><span aria-hidden="true">↓</span></a></li>
                </ol>
                <a href="#solving-method" className={styles.methodLink}>{t("Jump to the solving method →")}</a>
            </nav>
            <section id="easy" className={styles.section} aria-labelledby="easy-title">
                <header className={styles.sectionHeading}><span>01</span><div><p>{t("Easy · Riddles 01–04")}</p><h2 id="easy-title">{t("Find your way around the table")}</h2></div></header>
                <section id="riddle-01" className={styles.riddle} aria-labelledby="riddle-01-title">
                    <h3 id="riddle-01-title">{t.rich("Riddle <tag0>01</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("I sit at the end of period 3, in the noble-gas family. Welders can use my gas to help keep air away from hot metal. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 1")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Argon (Ar), atomic number 18.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("The noble-gas family points to group 18.")}</li>
                                <li>{t("Follow that column to period 3. The element at the intersection is argon.")}</li>
                                <li>{t("The welding clue confirms the choice: argon can provide a protective atmosphere around the weld.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> A family and a period can identify one element, even if you do not recognize its uses yet. <tag1>Source: RSC — Argon</tag1>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/18/argon">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-02" className={styles.riddle} aria-labelledby="riddle-02-title">
                    <h3 id="riddle-02-title">{t.rich("Riddle <tag0>02</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("Diamond and graphite are two forms of me. Find me in period 2, group 14. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 2")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Carbon (C), atomic number 6.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("Period 2 and group 14 meet at carbon.")}</li>
                                <li>{t.rich("Diamond and graphite both consist of carbon, with their atoms arranged differently. Different structural forms of the same element are called <tag0>allotropes</tag0>.", {tag0: chunks => <strong>{chunks}</strong>})}</li>
                                <li>{t("Graphite is used in pencil cores, so a familiar writing material and a diamond can contain the same element.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> Different appearances do not necessarily mean different elements. <tag1>Source: RSC — Carbon</tag1>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/6/carbon">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-03" className={styles.riddle} aria-labelledby="riddle-03-title">
                    <h3 id="riddle-03-title">{t.rich("Riddle <tag0>03</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("I am the alkali metal in period 3. Combined with chlorine, I form the compound that makes up ordinary table salt. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 3")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Sodium (Na), atomic number 11.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("Alkali metals occupy group 1, with hydrogen excluded from that metal family.")}</li>
                                <li>{t("The group 1 element in period 3 is sodium.")}</li>
                                <li>{t("Table salt is sodium chloride, NaCl. It contains sodium ions and chloride ions, rather than pieces of sodium metal mixed with chlorine gas.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> An element can be present in a compound whose properties differ greatly from those of the element on its own. <tag1>Source: RSC — Sodium</tag1>; <tag2>ionic compounds: OpenStax</tag2>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/11/sodium">{chunks}</a>, tag2: chunks => <a href="https://openstax.org/books/chemistry-2e/pages/2-6-ionic-and-molecular-compounds">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-04" className={styles.riddle} aria-labelledby="riddle-04-title">
                    <h3 id="riddle-04-title">{t.rich("Riddle <tag0>04</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("Go to the fourth period and the second group. You will find a metal whose compounds help build bones and teeth. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 4")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Calcium (Ca), atomic number 20.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("Group 2 is the alkaline-earth-metal family.")}</li>
                                <li>{t("Its period 4 member is calcium.")}</li>
                                <li>{t("Calcium phosphate is an important mineral component of bones and teeth. This clue refers to calcium in compounds, not calcium metal inside your body.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> “Alkali metal” and “alkaline earth metal” name different families: group 1 and group 2. <tag1>Source: RSC — Calcium</tag1>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/20/calcium">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
            </section>
            <section id="intermediate" className={styles.section} aria-labelledby="intermediate-title">
                <header className={styles.sectionHeading}><span>02</span><div><p>{t("Intermediate · Riddles 05–08")}</p><h2 id="intermediate-title">{t("Combine the clues")}</h2></div></header>
                <section id="riddle-05" className={styles.riddle} aria-labelledby="riddle-05-title">
                    <h3 id="riddle-05-title">{t.rich("Riddle <tag0>05</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("I am in period 2 and have an even atomic number. My usual elemental form is a gas at 20°C, but I am not a noble gas. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 5")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Oxygen (O), atomic number 8.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("The even-numbered elements in period 2 are beryllium, carbon, oxygen, and neon.")}</li>
                                <li>{t("The gas clue rules out beryllium and carbon, which are solids at 20°C under the stated pressure.")}</li>
                                <li>{t("Neon is a noble gas, so the final clue removes it. Oxygen remains; its usual elemental gas is O₂.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> A clue can be useful because of what it rules out. You do not need one clue that immediately reveals the answer. <tag1>Sources: RSC — Oxygen</tag1>, <tag2>Beryllium</tag2>, <tag3>Carbon</tag3>, and <tag4>Neon</tag4>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/8/oxygen">{chunks}</a>, tag2: chunks => <a href="https://periodic-table.rsc.org/element/4/beryllium">{chunks}</a>, tag3: chunks => <a href="https://periodic-table.rsc.org/element/6/carbon">{chunks}</a>, tag4: chunks => <a href="https://periodic-table.rsc.org/element/10/neon">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-06" className={styles.riddle} aria-labelledby="riddle-06-title">
                    <h3 id="riddle-06-title">{t.rich("Riddle <tag0>06</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("I belong to group 17. At 20°C, my elemental form is a red-brown liquid. I sit in period 4. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 6")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Bromine (Br), atomic number 35.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("Group 17 identifies the halogen family.")}</li>
                                <li>{t("Period 4 narrows that family to bromine.")}</li>
                                <li>{t("Bromine melts at about −7.2°C and boils at about 58.8°C at atmospheric pressure. Since 20°C lies between those temperatures, the liquid clue fits.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> A physical-state clue needs a temperature. “Liquid” describes an element under particular conditions. <tag1>Source: RSC — Bromine</tag1>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/35/bromine">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-07" className={styles.riddle} aria-labelledby="riddle-07-title">
                    <h3 id="riddle-07-title">{t.rich("Riddle <tag0>07</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("Move down one period from carbon without changing groups. You reach me: a solid used as a semiconductor in computer chips. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 7")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Silicon (Si), atomic number 14.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("Carbon is in group 14, period 2.")}</li>
                                <li>{t("Moving one period down in the same group brings you to period 3: silicon.")}</li>
                                <li>{t("Carefully purified silicon, with controlled additions of other elements, is used in semiconductor devices. The chip clue confirms the location clue.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> “Below” means a change of period within a group, not simply the next atomic number. <tag1>Sources: RSC — Silicon</tag1> and <tag2>Carbon</tag2>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/14/silicon">{chunks}</a>, tag2: chunks => <a href="https://periodic-table.rsc.org/element/6/carbon">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-08" className={styles.riddle} aria-labelledby="riddle-08-title">
                    <h3 id="riddle-08-title">{t.rich("Riddle <tag0>08</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("I am a reddish metal often drawn into electrical wires. My atomic number is greater than 28 but less than 31, and I belong to group 11. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 8")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Copper (Cu), atomic number 29.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("The number range leaves two possibilities: copper at 29 and zinc at 30.")}</li>
                                <li>{t("Copper belongs to group 11; zinc belongs to group 12. The group clue selects copper.")}</li>
                                <li>{t("Copper's reddish appearance and use in electrical wiring support the answer. A use alone is less decisive because several metals can conduct electricity.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> Combine a number range with a category or group before relying on a familiar use. <tag1>Sources: RSC — Copper</tag1> and <tag2>Zinc</tag2>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/29/copper">{chunks}</a>, tag2: chunks => <a href="https://periodic-table.rsc.org/element/30/zinc">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
            </section>
            <section id="challenge" className={styles.section} aria-labelledby="challenge-title">
                <header className={styles.sectionHeading}><span>03</span><div><p>{t("Challenge · Riddles 09–12")}</p><h2 id="challenge-title">{t("Check the exceptions")}</h2></div></header>
                <section id="riddle-09" className={styles.riddle} aria-labelledby="riddle-09-title">
                    <h3 id="riddle-09-title">{t.rich("Riddle <tag0>09</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("The standard table places me in group 1, but I am not an alkali metal. I am a nonmetal whose usual elemental form is a gas at 20°C. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 9")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Hydrogen (H), atomic number 1.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("Group 1 puts hydrogen in the same column as lithium, sodium, and the other alkali metals.")}</li>
                                <li>{t("The nonmetal clue separates hydrogen from those metals.")}</li>
                                <li>{t("Hydrogen's usual elemental form is H₂ gas under the stated conditions, consistent with the last clue.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> Group placement and element type are related, but they are not interchangeable. Matching a group does not always mean matching a metal family. <tag1>Sources: RSC — Hydrogen</tag1> and <tag2>OpenStax — The Periodic Table</tag2>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/1/hydrogen">{chunks}</a>, tag2: chunks => <a href="https://openstax.org/books/chemistry-2e/pages/2-5-the-periodic-table">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-10" className={styles.riddle} aria-labelledby="riddle-10-title">
                    <h3 id="riddle-10-title">{t.rich("Riddle <tag0>10</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("I stand with the noble gases in group 18, yet my ground-state electron configuration places me in the s-block. My neutral atom has just two electrons. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 10")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Helium (He), atomic number 2.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("A neutral atom with two electrons also has two protons, identifying atomic number 2: helium.")}</li>
                                <li>{t("Its electron configuration is 1s². Both electrons occupy an s orbital, which explains the s-block clue.")}</li>
                                <li>{t("Helium is placed in group 18 with the noble gases. Its position on the right of the table does not make it a p-block element under this electron-configuration convention.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> Check block and group separately. Helium is a useful exception to remember when interpreting element clues. <tag1>Source: RSC — Helium</tag1>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/2/helium">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-11" className={styles.riddle} aria-labelledby="riddle-11-title">
                    <h3 id="riddle-11-title">{t.rich("Riddle <tag0>11</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("My atomic number is below 40, and I am a group 13 metal. At atmospheric pressure, my equilibrium state is solid at 20°C, but my melting point is below 35°C. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 11")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Gallium (Ga), atomic number 31.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("Group 13 and an atomic number below 40 leave boron, aluminum, and gallium. The metal clue removes boron.")}</li>
                                <li>{t("Aluminum melts at about 660°C, so it fails the below-35°C clue. Gallium melts at about 29.76°C, leaving it as the answer.")}</li>
                                <li>{t("At 20°C, gallium is below its melting point, so its stable state is solid. Its low melting point does not make it a liquid at every temperature we might call warm.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> Check conditions before matching a state. Here, “equilibrium” means the stable state at the stated temperature; it avoids confusion with a liquid temporarily remaining below its freezing point. <tag1>Sources: RSC — Gallium</tag1> and <tag2>Aluminium</tag2>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/31/gallium">{chunks}</a>, tag2: chunks => <a href="https://periodic-table.rsc.org/element/13/aluminium">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-12" className={styles.riddle} aria-labelledby="riddle-12-title">
                    <h3 id="riddle-12-title">{t.rich("Riddle <tag0>12</tag0>", {tag0: chunks => <span>{chunks}</span>})}</h3>
                    <p className={styles.question}>{t("I am in period 4. My atomic number is lower than nickel's, but my tabulated relative atomic mass is slightly higher than nickel's. Which element am I?")}</p>
                    <details>
                        <summary>{t("Show answer and explanation")}{' '}<span className="sr-only">{t("for riddle 12")}</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p>{t.rich("<tag0>Answer: Cobalt (Co), atomic number 27.</tag0>", {tag0: chunks => <strong>{chunks}</strong>})}</p>
                            <ol>
                                <li>{t("Nickel has atomic number 28. The first two clues limit the search to period 4 elements from potassium, 19, through cobalt, 27.")}</li>
                                <li>{t("Cobalt's tabulated relative atomic mass is about 58.933, compared with nickel's 58.693. The earlier period 4 candidates all have lower tabulated values than nickel.")}</li>
                                <li>{t("Cobalt therefore fits both comparisons: a lower atomic number and a slightly higher relative atomic mass.")}</li>
                            </ol>
                            <p>{t.rich("<tag0>Takeaway:</tag0> Atomic number counts protons. Tabulated relative atomic mass reflects isotope masses and abundances. The two values do not always increase together, and neither comparison should replace the other. <tag1>Sources: RSC — Cobalt</tag1>, <tag2>Nickel</tag2>, and <tag3>periodic table</tag3>.", {tag0: chunks => <strong>{chunks}</strong>, tag1: chunks => <a href="https://periodic-table.rsc.org/element/27/cobalt">{chunks}</a>, tag2: chunks => <a href="https://periodic-table.rsc.org/element/28/nickel">{chunks}</a>, tag3: chunks => <a href="https://periodic-table.rsc.org/">{chunks}</a>})}</p>
                        </div>
                    </details>
                </section>
            </section>
            <section id="solving-method" className={styles.method} aria-labelledby="method-title">
                <p className={styles.eyebrow}>{t("FROM CLUES TO CONFIDENCE")}</p>
                <h2 id="method-title">{t("A method for solving element riddles")}</h2>
                <ol>
                    <li>{t.rich("<tag0>Start with a precise clue.</tag0> A period, group, or atomic-number range gives you a manageable set of candidates.", {tag0: chunks => <strong>{chunks}</strong>})}</li>
                    <li>{t.rich("<tag0>Cross out contradictions.</tag0> If the clue says gas, a solid does not fit under the same conditions. If it says nonmetal, remove metals.", {tag0: chunks => <strong>{chunks}</strong>})}</li>
                    <li>{t.rich("<tag0>Use the whole clue set.</tag0> Many elements share a use or a property. Keep checking until one candidate fits every clue.", {tag0: chunks => <strong>{chunks}</strong>})}</li>
                    <li>{t.rich("<tag0>Check the assumptions.</tag0> Group and block are different labels. Physical state depends on conditions. Atomic number and relative atomic mass are different quantities.", {tag0: chunks => <strong>{chunks}</strong>})}</li>
                </ol>
            </section>
            <section className={styles.cta} aria-labelledby="practice-title">
                <h2 id="practice-title">{t("Put the method into practice")}</h2>
                <p>{t("Ready for another set of clues?")}<Link href="/practice">{t("Try Elemendle's Element Challenges")}</Link>{t(", or")}<Link href="/">{t("play the daily element puzzle")}</Link>.</p>
                <p>{t("When you play, explain your next choice to yourself: “This element fits the period, but does it also fit the group and type?” That habit turns a guess into a reasoned choice.")}</p>
            </section>
            <footer className={styles.references}>
                <h2>{t("References and review")}</h2>
                <p>{t("Element properties were checked against the Royal Society of Chemistry's element fact boxes and uses sections, linked beside the explanations. Periodic-table organization and compound terminology were checked against OpenStax Chemistry 2e. The questions and explanations were written for Elemendle.")}</p>
                <p>{t("Facts checked: September 16, 2026.")}</p>
            </footer>
        </article>
    )
}
