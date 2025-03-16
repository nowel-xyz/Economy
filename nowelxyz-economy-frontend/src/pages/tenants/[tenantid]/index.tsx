import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_API } from "@/utils/urls";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";

const TenantPage = ({ tenantData }: { tenantData: any }) => {
    const [calendar, setCalendar] = useState<{ day: number; balance: number; transactions: any[] }[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [dayTransactions, setDayTransactions] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const currentDate = new Date();
    const router = useRouter();
    const { year: urlYear, month: urlMonth } = router.query;
    const [year, setYear] = useState(urlYear ? parseInt(urlYear as string) : currentDate.getFullYear());
    const [month, setMonth] = useState(urlMonth ? parseInt(urlMonth as string) : currentDate.getMonth() + 1);
    const { tenantid } = router.query;

    useEffect(() => {
        const fetchCalendar = async () => {
            if (!tenantid) return;

            try {
                setError(null); // Reset error before fetching

                const response = await axios.get(
                    `${BACKEND_API}/tenant/${tenantid}/calendar/${year}/${month}`,
                    { withCredentials: true }
                );

                console.log("API Response:", response.data);

                let fetchedDays = response.data.data?.days || [];

                const daysInMonth = new Date(year, month, 0).getDate();
                const fullCalendar = Array.from({ length: daysInMonth }, (_, i) => {
                    const transactions = fetchedDays.find((d: { day: any }) => Number(d.day) === i + 1)?.active || [];
                    
                    const balance = transactions.reduce((acc: number, tx: any) => {
                        return acc + (tx.incomeExpense === "add" ? tx.amount : -tx.amount);
                    }, 0);

                    return { day: i + 1, balance, transactions }; // Store transactions for each day
                });

                setCalendar(fullCalendar);
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    console.warn("No data found for this month/year.");
                    setError("No transaction data available for this period.");
                    setCalendar([]); // Set calendar as empty
                } else {
                    console.error("Axios Fetch Error:", error);
                    setError("An error occurred while fetching data.");
                }
            }
        };

        fetchCalendar();
    }, [year, month, tenantid]);

    const changeMonth = (offset: number) => {
        let newMonth = month + offset;
        let newYear = year;

        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }

        setMonth(newMonth);
        setYear(newYear);
        router.push(`/tenants/${tenantid}?year=${newYear}&month=${newMonth}`, undefined, { shallow: true });
    };

    const changeYear = (offset: number) => {
        const newYear = year + offset;
        setYear(newYear);
        router.push(`/tenants/${tenantid}?year=${newYear}&month=${month}`, undefined, { shallow: true });
    };

    const handleDayClick = (day: number) => {
        const selected = calendar.find(d => d.day === day);
        if (selected) {
            setSelectedDay(day);
            setDayTransactions(selected.transactions); // Set the transactions for that day
        }
    };

    return (
        <div className="container">
            <h1 className="title">Tenant Info</h1>
            <pre className="tenant-data">{JSON.stringify(tenantData, null, 2)}</pre>

            <div className="controls">
                <button onClick={() => changeYear(-1)}>◀ Previous Year</button>
                <span>{year}</span>
                <button onClick={() => changeYear(1)}>Next Year ▶</button>
            </div>

            <div className="controls">
                <button onClick={() => changeMonth(-1)}>◀ Previous Month</button>
                <span>{new Date(year, month - 1).toLocaleString("default", { month: "long" })}</span>
                <button onClick={() => changeMonth(1)}>Next Month ▶</button>
            </div>

            <h2 className="subtitle">Calendar for {year}-{month}</h2>

            {error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="calendar">
                    {calendar.length > 0 ? (
                        calendar.map((day) => (
                            <div
                                key={day.day}
                                className={`calendar-day ${day.balance > 0 ? "positive" : day.balance < 0 ? "negative" : ""}`}
                                onClick={() => handleDayClick(day.day)}
                            >
                                <strong>{day.day}</strong>
                                <span>{day.balance !== 0 ? `${day.balance > 0 ? "+" : ""}${day.balance}` : ""}</span>
                            </div>
                        ))
                    ) : (
                        <p className="no-data">No data available for this month.</p>
                    )}
                </div>
            )}

            {selectedDay !== null && (
                <div className="day-info">
                    <h3>Details for Day {selectedDay}</h3>
                    {dayTransactions.length > 0 ? (
                        <ul>
                            {dayTransactions.map((transaction, index) => (
                                <li key={index}>
                                    <p><strong>Amount:</strong> {transaction.amount}</p>
                                    <p><strong>Type:</strong> {transaction.incomeExpense === "add" ? "Added" : "Removed"}</p>
                                    <p><strong>Time:</strong> {new Date(transaction.time).toLocaleString()}</p>
                                    <hr />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No transactions for this day.</p>
                    )}
                </div>
            )}

            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: auto;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                }

                .title {
                    text-align: center;
                    font-size: 24px;
                    margin-bottom: 10px;
                }

                .subtitle {
                    text-align: center;
                    font-size: 20px;
                    margin-bottom: 20px;
                }

                .controls {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                button {
                    padding: 8px 12px;
                    font-size: 16px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    background-color: #007bff;
                    color: white;
                    transition: background 0.3s;
                }

                button:hover {
                    background-color: #0056b3;
                }

                .calendar {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 10px;
                    text-align: center;
                }

                .calendar-day {
                    background: #f0f0f0;
                    padding: 15px;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .calendar-day:hover {
                    background: #e0e0e0;
                }

                .positive {
                    background: #d4f5d4;
                    color: green;
                }

                .negative {
                    background: #f5d4d4;
                    color: red;
                }

                .tenant-data {
                    background: #f8f8f8;
                    padding: 10px;
                    border-radius: 5px;
                    white-space: pre-wrap;
                }

                .error-message {
                    text-align: center;
                    color: red;
                    font-size: 16px;
                    margin-top: 10px;
                }

                .no-data {
                    text-align: center;
                    font-size: 16px;
                    color: #888;
                }

                .day-info {
                    margin-top: 30px;
                    padding: 15px;
                    background: #f4f4f4;
                    border-radius: 5px;
                }

                .day-info ul {
                    list-style-type: none;
                    padding: 0;
                }

                .day-info li {
                    margin-bottom: 15px;
                }

                .day-info hr {
                    margin-top: 10px;
                }
            `}</style>
        </div>
    );
};

export default TenantPage;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const tenantDataHeader = req.headers['x-tenant-data'];

    let tenantData = null;
    if (tenantDataHeader) {
        try {
            tenantData = JSON.parse(tenantDataHeader as string);
        } catch (e) {
            console.error('Failed to parse tenant data:', e);
        }
    }

    return {
        props: {
            tenantData,
        },
    };
};
