import React, { useState } from 'react'
import './index.css'
import { 
  FaQuestionCircle, 
  FaBook, 
  FaEnvelope, 
  FaPhone, 
  FaVideo, 
  FaFileAlt,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaInfoCircle,
  FaLightbulb,
  FaExclamationTriangle
} from 'react-icons/fa'
import { MdSupportAgent, MdHelpOutline } from 'react-icons/md'

const Help = () => {
  const [openCategory, setOpenCategory] = useState(null)
  const [openFAQ, setOpenFAQ] = useState(null)

  const faqCategories = [
    {
      id: 1,
      title: 'Getting Started',
      icon: <FaBook />,
      faqs: [
        {
          question: 'How do I create my first menu?',
          answer: 'Navigate to the Menu section from the sidebar, click "Add Menu Item", fill in the details (name, price, category, description), upload an image if available, and click Save. Your menu item will be immediately available for customers.'
        },
        {
          question: 'How do I set up tables?',
          answer: 'Go to the Tables section, click "Add Area" to create a dining area first, then add tables to that area. You can specify table capacity and status (available, reserved, in use).'
        },
        {
          question: 'How do I add staff members?',
          answer: 'Navigate to Staff section, click "Add Staff", enter their details (name, role, contact), and assign them to your restaurant. Staff members will receive login credentials to access their dashboard.'
        }
      ]
    },
    {
      id: 2,
      title: 'Orders & POS',
      icon: <FaFileAlt />,
      faqs: [
        {
          question: 'How do I process an order?',
          answer: 'Go to the Orders section to view all orders. Click on an order to see details. You can update order status (Pending, Preparing, Ready, Completed) and generate KOT (Kitchen Order Ticket) or Bill from the order details.'
        },
        {
          question: 'How does the POS system work?',
          answer: 'The POS (Point of Sale) system allows you to create orders directly. Select items from the menu, assign a table and waiter, add discounts if needed, and generate KOT. You can also print bills and process payments.'
        },
        {
          question: 'How do I handle order cancellations?',
          answer: 'In the Orders section, open the order you want to cancel, click on the order status dropdown, and select "Cancelled". The table will be automatically freed up for new orders.'
        }
      ]
    },
    {
      id: 3,
      title: 'Payments & Billing',
      icon: <FaCheckCircle />,
      faqs: [
        {
          question: 'How do I generate a bill?',
          answer: 'In the Orders section, select an order and click "Bill" or "Bill & Print". The system will calculate the total including tax and any discounts applied. You can also generate bills from the POS section.'
        },
        {
          question: 'How do I apply discounts?',
          answer: 'When creating an order in POS or editing an existing order, click "Add Discount". You can choose between percentage or fixed amount discount. The discount will be automatically applied to the total.'
        },
        {
          question: 'How are taxes calculated?',
          answer: 'Taxes are automatically calculated at 10% of the subtotal. You can view the tax amount in the order summary before generating the bill.'
        }
      ]
    },
    {
      id: 4,
      title: 'Reservations & Tables',
      icon: <FaInfoCircle />,
      faqs: [
        {
          question: 'How do I manage table reservations?',
          answer: 'Go to the Reservations section to view all reservations. You can create new reservations, update existing ones, or cancel reservations. The table status will automatically update based on reservations.'
        },
        {
          question: 'How do I check table availability?',
          answer: 'In the Tables section, you can see all tables with their current status: Available (green), Reserved (yellow), or In Use (red). Click on a table to see its details and order history.'
        },
        {
          question: 'Can I change table capacity?',
          answer: 'Yes, go to Tables section, click on the table you want to edit, and update the seat capacity. Changes will be saved immediately.'
        }
      ]
    },
    {
      id: 5,
      title: 'Menu Management',
      icon: <FaLightbulb />,
      faqs: [
        {
          question: 'How do I organize menu items into categories?',
          answer: 'In the Menu section, first create menu categories (e.g., Appetizers, Main Course, Desserts). Then when adding menu items, assign them to the appropriate category. You can edit or delete categories anytime.'
        },
        {
          question: 'How do I mark items as unavailable?',
          answer: 'In the Menu section, find the item you want to mark as unavailable, click on it, and change the availability status to "No". The item will be hidden from customer menus but remain in your system.'
        },
        {
          question: 'Can I update item prices?',
          answer: 'Yes, go to Menu section, click on any menu item, edit the price field, and save. The new price will be reflected immediately for all new orders.'
        }
      ]
    },
    {
      id: 6,
      title: 'Troubleshooting',
      icon: <FaExclamationTriangle />,
      faqs: [
        {
          question: 'I cannot see my orders. What should I do?',
          answer: 'Check your internet connection first. If connected, try refreshing the page. If the issue persists, log out and log back in. Orders should appear in real-time once connected.'
        },
        {
          question: 'The POS is not generating KOT. What\'s wrong?',
          answer: 'Ensure you have selected at least one menu item and assigned a table. Check that all required fields are filled. If the issue continues, try clearing your browser cache or using a different browser.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Currently, password reset must be done through the login page. Click "Forgot Password" and follow the instructions. If you need immediate assistance, contact support.'
        }
      ]
    }
  ]

  const quickGuides = [
    {
      title: 'Quick Start Guide',
      description: 'Learn the basics of using the restaurant dashboard',
      icon: <FaBook />,
      steps: [
        'Set up your restaurant profile',
        'Create menu categories and items',
        'Add tables and dining areas',
        'Add staff members',
        'Start taking orders!'
      ]
    },
    {
      title: 'Order Management',
      description: 'Master order processing and tracking',
      icon: <FaFileAlt />,
      steps: [
        'View all orders in the Orders section',
        'Update order status as it progresses',
        'Generate KOT for kitchen',
        'Create bills and process payments',
        'Track order history'
      ]
    },
    {
      title: 'Staff Management',
      description: 'Manage your restaurant staff efficiently',
      icon: <MdSupportAgent />,
      steps: [
        'Add staff members with roles',
        'Assign waiters to tables',
        'Track staff performance',
        'Manage staff permissions',
        'View staff activity'
      ]
    }
  ]

  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId)
    setOpenFAQ(null)
  }

  const toggleFAQ = (faqIndex) => {
    setOpenFAQ(openFAQ === faqIndex ? null : faqIndex)
  }

  return (
    <div className="dash-main-m">
      <div className="help-container">
        <div className="help-header">
          <div className="help-header-content">
            <div className="help-header-icon">
              <MdHelpOutline className="help-header-icon-svg" />
            </div>
            <div className="help-header-info">
              <h1 className="help-header-title">Help & Support Center</h1>
              <p className="help-header-subtitle">Find answers to your questions and get the support you need</p>
            </div>
          </div>
        </div>

        <div className="help-content">
          <div className="help-quick-links">
            <h2 className="help-section-title">
              <FaQuestionCircle className="help-section-icon" />
              Quick Links
            </h2>
            <div className="help-quick-links-grid">
              <div className="help-quick-link-card">
                <FaBook className="help-quick-link-icon" />
                <h3>Documentation</h3>
                <p>Complete user guide and documentation</p>
              </div>
              <div className="help-quick-link-card">
                <FaVideo className="help-quick-link-icon" />
                <h3>Video Tutorials</h3>
                <p>Watch step-by-step video guides</p>
              </div>
              <div className="help-quick-link-card">
                <FaEnvelope className="help-quick-link-icon" />
                <h3>Email Support</h3>
                <p>support@restaurantapp.com</p>
              </div>
              <div className="help-quick-link-card">
                <FaPhone className="help-quick-link-icon" />
                <h3>Phone Support</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="help-quick-guides">
            <h2 className="help-section-title">
              <FaLightbulb className="help-section-icon" />
              Quick Guides
            </h2>
            <div className="help-quick-guides-grid">
              {quickGuides.map((guide, index) => (
                <div key={index} className="help-quick-guide-card">
                  <div className="help-quick-guide-icon">{guide.icon}</div>
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                  <ul className="help-quick-guide-steps">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="help-faq-section">
            <h2 className="help-section-title">
              <FaQuestionCircle className="help-section-icon" />
              Frequently Asked Questions
            </h2>
            <div className="help-faq-categories">
              {faqCategories.map((category) => (
                <div key={category.id} className="help-faq-category">
                  <button
                    className="help-faq-category-header"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="help-faq-category-title">
                      <span className="help-faq-category-icon">{category.icon}</span>
                      <span>{category.title}</span>
                    </div>
                    {openCategory === category.id ? (
                      <FaChevronUp className="help-faq-chevron" />
                    ) : (
                      <FaChevronDown className="help-faq-chevron" />
                    )}
                  </button>
                  {openCategory === category.id && (
                    <div className="help-faq-list">
                      {category.faqs.map((faq, faqIndex) => {
                        const uniqueKey = `${category.id}-${faqIndex}`
                        return (
                          <div key={uniqueKey} className="help-faq-item">
                            <button
                              className="help-faq-question"
                              onClick={() => toggleFAQ(uniqueKey)}
                            >
                              <span>{faq.question}</span>
                              {openFAQ === uniqueKey ? (
                                <FaChevronUp className="help-faq-chevron-small" />
                              ) : (
                                <FaChevronDown className="help-faq-chevron-small" />
                              )}
                            </button>
                            {openFAQ === uniqueKey && (
                              <div className="help-faq-answer">
                                <p>{faq.answer}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="help-contact-section">
            <h2 className="help-section-title">
              <MdSupportAgent className="help-section-icon" />
              Need More Help?
            </h2>
            <div className="help-contact-cards">
              <div className="help-contact-card">
                <FaEnvelope className="help-contact-icon" />
                <h3>Email Support</h3>
                <p>Get help via email</p>
                <a href="mailto:support@restaurantapp.com" className="help-contact-link">
                  support@restaurantapp.com
                </a>
              </div>
              <div className="help-contact-card">
                <FaPhone className="help-contact-icon" />
                <h3>Phone Support</h3>
                <p>Call us for immediate assistance</p>
                <a href="tel:+15551234567" className="help-contact-link">
                  +1 (555) 123-4567
                </a>
                <p className="help-contact-hours">Mon-Fri: 9 AM - 6 PM EST</p>
              </div>
              <div className="help-contact-card">
                <FaFileAlt className="help-contact-icon" />
                <h3>Knowledge Base</h3>
                <p>Browse our comprehensive guides</p>
                <a href="#" className="help-contact-link">
                  Visit Knowledge Base
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help

