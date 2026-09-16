// Content adapted from docs/content-drafts/periodic-table-riddles.en.md (en-v1).
import { Link } from '@/i18n/routing'
import styles from './riddles.module.css'

export default function RiddlesArticle() {
    return (
        <article className={styles.article}>
            <header className={styles.hero}>
                <p className={styles.eyebrow}>THE ELEMENDLE FIELD GUIDE · 01</p>
                <h1>Periodic Table Riddles <span>with Answers</span></h1>
                <div className={styles.intro}>
                    <p>Can you recognize an element from its position, properties, or everyday uses? These 12 original riddles from Elemendle start with simple clues and work up to a few periodic-table surprises. Each answer includes an explanation so you can see how the clues fit together.</p>
                    <p>Try each question before opening its answer. You can use a periodic table: the goal is to practice reasoning, not to memorize every element.</p>
                </div>
                <p className={styles.meta}>12 original riddles <span aria-hidden="true">/</span> 3 difficulty levels <span aria-hidden="true">/</span> Step-by-step explanations</p>
            </header>
            <section className={styles.before} aria-labelledby="before-you-start">
                <h2 id="before-you-start">Before you start</h2>
                <ul>
                    <li><strong>Periods</strong> are the horizontal rows. <strong>Groups</strong> are the vertical columns; this guide uses group numbers <strong>1–18</strong>.</li>
                    <li>Every answer is a chemical element. A clue may mention a compound containing that element, but the compound is not the answer.</li>
                    <li>For physical-state clues, use the stated temperature and ordinary atmospheric pressure, approximately 1 atm. A gas clue refers to the element&#x27;s usual gaseous form, such as O₂ for oxygen.</li>
                    <li>Difficulty labels describe the kinds of reasoning involved. Move between sections whenever you like.</li>
                </ul>
                <p>The row and column conventions follow the standard layout explained in <a href="https://openstax.org/books/chemistry-2e/pages/2-5-the-periodic-table">OpenStax&#x27;s periodic table guide</a>.</p>
            </section>
            <nav className={styles.contents} aria-label="Guide contents">
                <p>CHOOSE YOUR STARTING POINT</p>
                <ol>
                    <li><a href="#easy"><span>01 / Easy</span><strong>Find your way around the table</strong><span aria-hidden="true">↓</span></a></li>
                    <li><a href="#intermediate"><span>02 / Intermediate</span><strong>Combine the clues</strong><span aria-hidden="true">↓</span></a></li>
                    <li><a href="#challenge"><span>03 / Challenge</span><strong>Check the exceptions</strong><span aria-hidden="true">↓</span></a></li>
                </ol>
                <a href="#solving-method" className={styles.methodLink}>Jump to the solving method →</a>
            </nav>
            <section id="easy" className={styles.section} aria-labelledby="easy-title">
                <header className={styles.sectionHeading}><span>01</span><div><p>Easy · Riddles 01–04</p><h2 id="easy-title">Find your way around the table</h2></div></header>
                <section id="riddle-01" className={styles.riddle} aria-labelledby="riddle-01-title">
                    <h3 id="riddle-01-title">Riddle <span>01</span></h3>
                    <p className={styles.question}>I sit at the end of period 3, in the noble-gas family. Welders can use my gas to help keep air away from hot metal. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 1</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Argon (Ar), atomic number 18.</strong></p>
                            <ol>
                                <li>The noble-gas family points to group 18.</li>
                                <li>Follow that column to period 3. The element at the intersection is argon.</li>
                                <li>The welding clue confirms the choice: argon can provide a protective atmosphere around the weld.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> A family and a period can identify one element, even if you do not recognize its uses yet. <a href="https://periodic-table.rsc.org/element/18/argon">Source: RSC — Argon</a>.</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-02" className={styles.riddle} aria-labelledby="riddle-02-title">
                    <h3 id="riddle-02-title">Riddle <span>02</span></h3>
                    <p className={styles.question}>Diamond and graphite are two forms of me. Find me in period 2, group 14. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 2</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Carbon (C), atomic number 6.</strong></p>
                            <ol>
                                <li>Period 2 and group 14 meet at carbon.</li>
                                <li>Diamond and graphite both consist of carbon, with their atoms arranged differently. Different structural forms of the same element are called <strong>allotropes</strong>.</li>
                                <li>Graphite is used in pencil cores, so a familiar writing material and a diamond can contain the same element.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> Different appearances do not necessarily mean different elements. <a href="https://periodic-table.rsc.org/element/6/carbon">Source: RSC — Carbon</a>.</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-03" className={styles.riddle} aria-labelledby="riddle-03-title">
                    <h3 id="riddle-03-title">Riddle <span>03</span></h3>
                    <p className={styles.question}>I am the alkali metal in period 3. Combined with chlorine, I form the compound that makes up ordinary table salt. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 3</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Sodium (Na), atomic number 11.</strong></p>
                            <ol>
                                <li>Alkali metals occupy group 1, with hydrogen excluded from that metal family.</li>
                                <li>The group 1 element in period 3 is sodium.</li>
                                <li>Table salt is sodium chloride, NaCl. It contains sodium ions and chloride ions, rather than pieces of sodium metal mixed with chlorine gas.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> An element can be present in a compound whose properties differ greatly from those of the element on its own. <a href="https://periodic-table.rsc.org/element/11/sodium">Source: RSC — Sodium</a>; <a href="https://openstax.org/books/chemistry-2e/pages/2-6-ionic-and-molecular-compounds">ionic compounds: OpenStax</a>.</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-04" className={styles.riddle} aria-labelledby="riddle-04-title">
                    <h3 id="riddle-04-title">Riddle <span>04</span></h3>
                    <p className={styles.question}>Go to the fourth period and the second group. You will find a metal whose compounds help build bones and teeth. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 4</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Calcium (Ca), atomic number 20.</strong></p>
                            <ol>
                                <li>Group 2 is the alkaline-earth-metal family.</li>
                                <li>Its period 4 member is calcium.</li>
                                <li>Calcium phosphate is an important mineral component of bones and teeth. This clue refers to calcium in compounds, not calcium metal inside your body.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> “Alkali metal” and “alkaline earth metal” name different families: group 1 and group 2. <a href="https://periodic-table.rsc.org/element/20/calcium">Source: RSC — Calcium</a>.</p>
                        </div>
                    </details>
                </section>
            </section>
            <section id="intermediate" className={styles.section} aria-labelledby="intermediate-title">
                <header className={styles.sectionHeading}><span>02</span><div><p>Intermediate · Riddles 05–08</p><h2 id="intermediate-title">Combine the clues</h2></div></header>
                <section id="riddle-05" className={styles.riddle} aria-labelledby="riddle-05-title">
                    <h3 id="riddle-05-title">Riddle <span>05</span></h3>
                    <p className={styles.question}>I am in period 2 and have an even atomic number. My usual elemental form is a gas at 20°C, but I am not a noble gas. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 5</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Oxygen (O), atomic number 8.</strong></p>
                            <ol>
                                <li>The even-numbered elements in period 2 are beryllium, carbon, oxygen, and neon.</li>
                                <li>The gas clue rules out beryllium and carbon, which are solids at 20°C under the stated pressure.</li>
                                <li>Neon is a noble gas, so the final clue removes it. Oxygen remains; its usual elemental gas is O₂.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> A clue can be useful because of what it rules out. You do not need one clue that immediately reveals the answer. <a href="https://periodic-table.rsc.org/element/8/oxygen">Sources: RSC — Oxygen</a>, <a href="https://periodic-table.rsc.org/element/4/beryllium">Beryllium</a>, <a href="https://periodic-table.rsc.org/element/6/carbon">Carbon</a>, and <a href="https://periodic-table.rsc.org/element/10/neon">Neon</a>.</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-06" className={styles.riddle} aria-labelledby="riddle-06-title">
                    <h3 id="riddle-06-title">Riddle <span>06</span></h3>
                    <p className={styles.question}>I belong to group 17. At 20°C, my elemental form is a red-brown liquid. I sit in period 4. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 6</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Bromine (Br), atomic number 35.</strong></p>
                            <ol>
                                <li>Group 17 identifies the halogen family.</li>
                                <li>Period 4 narrows that family to bromine.</li>
                                <li>Bromine melts at about −7.2°C and boils at about 58.8°C at atmospheric pressure. Since 20°C lies between those temperatures, the liquid clue fits.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> A physical-state clue needs a temperature. “Liquid” describes an element under particular conditions. <a href="https://periodic-table.rsc.org/element/35/bromine">Source: RSC — Bromine</a>.</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-07" className={styles.riddle} aria-labelledby="riddle-07-title">
                    <h3 id="riddle-07-title">Riddle <span>07</span></h3>
                    <p className={styles.question}>Move down one period from carbon without changing groups. You reach me: a solid used as a semiconductor in computer chips. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 7</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Silicon (Si), atomic number 14.</strong></p>
                            <ol>
                                <li>Carbon is in group 14, period 2.</li>
                                <li>Moving one period down in the same group brings you to period 3: silicon.</li>
                                <li>Carefully purified silicon, with controlled additions of other elements, is used in semiconductor devices. The chip clue confirms the location clue.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> “Below” means a change of period within a group, not simply the next atomic number. <a href="https://periodic-table.rsc.org/element/14/silicon">Sources: RSC — Silicon</a> and <a href="https://periodic-table.rsc.org/element/6/carbon">Carbon</a>.</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-08" className={styles.riddle} aria-labelledby="riddle-08-title">
                    <h3 id="riddle-08-title">Riddle <span>08</span></h3>
                    <p className={styles.question}>I am a reddish metal often drawn into electrical wires. My atomic number is greater than 28 but less than 31, and I belong to group 11. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 8</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Copper (Cu), atomic number 29.</strong></p>
                            <ol>
                                <li>The number range leaves two possibilities: copper at 29 and zinc at 30.</li>
                                <li>Copper belongs to group 11; zinc belongs to group 12. The group clue selects copper.</li>
                                <li>Copper&#x27;s reddish appearance and use in electrical wiring support the answer. A use alone is less decisive because several metals can conduct electricity.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> Combine a number range with a category or group before relying on a familiar use. <a href="https://periodic-table.rsc.org/element/29/copper">Sources: RSC — Copper</a> and <a href="https://periodic-table.rsc.org/element/30/zinc">Zinc</a>.</p>
                        </div>
                    </details>
                </section>
            </section>
            <section id="challenge" className={styles.section} aria-labelledby="challenge-title">
                <header className={styles.sectionHeading}><span>03</span><div><p>Challenge · Riddles 09–12</p><h2 id="challenge-title">Check the exceptions</h2></div></header>
                <section id="riddle-09" className={styles.riddle} aria-labelledby="riddle-09-title">
                    <h3 id="riddle-09-title">Riddle <span>09</span></h3>
                    <p className={styles.question}>The standard table places me in group 1, but I am not an alkali metal. I am a nonmetal whose usual elemental form is a gas at 20°C. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 9</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Hydrogen (H), atomic number 1.</strong></p>
                            <ol>
                                <li>Group 1 puts hydrogen in the same column as lithium, sodium, and the other alkali metals.</li>
                                <li>The nonmetal clue separates hydrogen from those metals.</li>
                                <li>Hydrogen&#x27;s usual elemental form is H₂ gas under the stated conditions, consistent with the last clue.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> Group placement and element type are related, but they are not interchangeable. Matching a group does not always mean matching a metal family. <a href="https://periodic-table.rsc.org/element/1/hydrogen">Sources: RSC — Hydrogen</a> and <a href="https://openstax.org/books/chemistry-2e/pages/2-5-the-periodic-table">OpenStax — The Periodic Table</a>.</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-10" className={styles.riddle} aria-labelledby="riddle-10-title">
                    <h3 id="riddle-10-title">Riddle <span>10</span></h3>
                    <p className={styles.question}>I stand with the noble gases in group 18, yet my ground-state electron configuration places me in the s-block. My neutral atom has just two electrons. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 10</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Helium (He), atomic number 2.</strong></p>
                            <ol>
                                <li>A neutral atom with two electrons also has two protons, identifying atomic number 2: helium.</li>
                                <li>Its electron configuration is 1s². Both electrons occupy an s orbital, which explains the s-block clue.</li>
                                <li>Helium is placed in group 18 with the noble gases. Its position on the right of the table does not make it a p-block element under this electron-configuration convention.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> Check block and group separately. Helium is a useful exception to remember when interpreting element clues. <a href="https://periodic-table.rsc.org/element/2/helium">Source: RSC — Helium</a>.</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-11" className={styles.riddle} aria-labelledby="riddle-11-title">
                    <h3 id="riddle-11-title">Riddle <span>11</span></h3>
                    <p className={styles.question}>My atomic number is below 40, and I am a group 13 metal. At atmospheric pressure, my equilibrium state is solid at 20°C, but my melting point is below 35°C. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 11</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Gallium (Ga), atomic number 31.</strong></p>
                            <ol>
                                <li>Group 13 and an atomic number below 40 leave boron, aluminum, and gallium. The metal clue removes boron.</li>
                                <li>Aluminum melts at about 660°C, so it fails the below-35°C clue. Gallium melts at about 29.76°C, leaving it as the answer.</li>
                                <li>At 20°C, gallium is below its melting point, so its stable state is solid. Its low melting point does not make it a liquid at every temperature we might call warm.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> Check conditions before matching a state. Here, “equilibrium” means the stable state at the stated temperature; it avoids confusion with a liquid temporarily remaining below its freezing point. <a href="https://periodic-table.rsc.org/element/31/gallium">Sources: RSC — Gallium</a> and <a href="https://periodic-table.rsc.org/element/13/aluminium">Aluminium</a>.</p>
                        </div>
                    </details>
                </section>
                <section id="riddle-12" className={styles.riddle} aria-labelledby="riddle-12-title">
                    <h3 id="riddle-12-title">Riddle <span>12</span></h3>
                    <p className={styles.question}>I am in period 4. My atomic number is lower than nickel&#x27;s, but my tabulated relative atomic mass is slightly higher than nickel&#x27;s. Which element am I?</p>
                    <details>
                        <summary>Show answer and explanation<span className="sr-only"> for riddle 12</span><span aria-hidden="true" className={styles.plus}>+</span></summary>
                        <div className={styles.answer}>
                            <p><strong>Answer: Cobalt (Co), atomic number 27.</strong></p>
                            <ol>
                                <li>Nickel has atomic number 28. The first two clues limit the search to period 4 elements from potassium, 19, through cobalt, 27.</li>
                                <li>Cobalt&#x27;s tabulated relative atomic mass is about 58.933, compared with nickel&#x27;s 58.693. The earlier period 4 candidates all have lower tabulated values than nickel.</li>
                                <li>Cobalt therefore fits both comparisons: a lower atomic number and a slightly higher relative atomic mass.</li>
                            </ol>
                            <p><strong>Takeaway:</strong> Atomic number counts protons. Tabulated relative atomic mass reflects isotope masses and abundances. The two values do not always increase together, and neither comparison should replace the other. <a href="https://periodic-table.rsc.org/element/27/cobalt">Sources: RSC — Cobalt</a>, <a href="https://periodic-table.rsc.org/element/28/nickel">Nickel</a>, and <a href="https://periodic-table.rsc.org/">periodic table</a>.</p>
                        </div>
                    </details>
                </section>
            </section>
            <section id="solving-method" className={styles.method} aria-labelledby="method-title">
                <p className={styles.eyebrow}>FROM CLUES TO CONFIDENCE</p>
                <h2 id="method-title">A method for solving element riddles</h2>
                <ol>
                    <li><strong>Start with a precise clue.</strong> A period, group, or atomic-number range gives you a manageable set of candidates.</li>
                    <li><strong>Cross out contradictions.</strong> If the clue says gas, a solid does not fit under the same conditions. If it says nonmetal, remove metals.</li>
                    <li><strong>Use the whole clue set.</strong> Many elements share a use or a property. Keep checking until one candidate fits every clue.</li>
                    <li><strong>Check the assumptions.</strong> Group and block are different labels. Physical state depends on conditions. Atomic number and relative atomic mass are different quantities.</li>
                </ol>
            </section>
            <section className={styles.cta} aria-labelledby="practice-title">
                <h2 id="practice-title">Put the method into practice</h2>
                <p>Ready for another set of clues? <Link href="/practice" locale="en">Try Elemendle&#x27;s Element Challenges</Link>, or <Link href="/" locale="en">play the daily element puzzle</Link>.</p>
                <p>When you play, explain your next choice to yourself: “This element fits the period, but does it also fit the group and type?” That habit turns a guess into a reasoned choice.</p>
            </section>
            <footer className={styles.references}>
                <h2>References and review</h2>
                <p>Element properties were checked against the Royal Society of Chemistry&#x27;s element fact boxes and uses sections, linked beside the explanations. Periodic-table organization and compound terminology were checked against OpenStax Chemistry 2e. The questions and explanations were written for Elemendle.</p>
                <p>Facts checked: September 16, 2026.</p>
            </footer>
        </article>
    )
}
